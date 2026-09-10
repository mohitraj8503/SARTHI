export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/messaging/auth";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ conversationId: string }> }
) {
  const params = await props.params;
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    // Check if user is part of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: user.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 403 }
      );
    }

    // Mark all messages in the conversation as read
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Reset unread count for the current user
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    // Broadcast read event to other participants in the conversation
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: user.id },
      },
      select: { userId: true }
    });
    const participantIds = otherParticipants.map(p => p.userId);
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    await broadcastToUsers(participantIds, "message:read", {
      conversationId,
      userId: user.id,
      readAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
