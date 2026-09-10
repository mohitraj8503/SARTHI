export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/messaging/auth";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  const params = await props.params;
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, messageId } = params;
    const { reactionType } = await request.json();

    // Validate reaction type
    const validReactions = ["thumbsup", "heart", "laugh", "eyes"];
    if (!reactionType || !validReactions.includes(reactionType)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

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

    // Check if message exists and belongs to this conversation
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user already reacted with this type
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: user.id,
        type: reactionType,
      },
    });

    let isRemoved = false;
    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.messageReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
      isRemoved = true;
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId: user.id,
          type: reactionType,
        },
      });
    }

    // Return updated reaction count
    const updatedReactionsCount = await prisma.messageReaction.count({
      where: {
        messageId,
        type: reactionType,
      },
    });

    // Broadcast reaction event to other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: user.id },
      },
      select: { userId: true }
    });
    const participantIds = otherParticipants.map(p => p.userId);
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    await broadcastToUsers(participantIds, "message:reaction", {
      conversationId,
      messageId,
      userId: user.id,
      reactionType,
      isRemoved
    });

    return NextResponse.json({
      reaction: {
        type: reactionType,
        count: updatedReactionsCount,
        me: !isRemoved,
      },
    });
  } catch (error) {
    console.error("Error processing reaction:", error);
    return NextResponse.json(
      { error: "Failed to process reaction" },
      { status: 500 }
    );
  }
}