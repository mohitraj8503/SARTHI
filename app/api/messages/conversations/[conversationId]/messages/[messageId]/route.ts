export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/messaging/auth";

export async function PATCH(
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
    const { content: newText, isPinned } = await request.json();

    // Check if participant of the conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id }
    });

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Find the message
    const message = await prisma.chatMessage.findFirst({
      where: { id: messageId, conversationId },
      include: { sender: true }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    let updatedContent = message.content;

    // Resolve current metadata
    let currentMeta: any = {};
    try {
      currentMeta = JSON.parse(message.content);
      if (typeof currentMeta !== "object" || currentMeta === null || !("text" in currentMeta)) {
        currentMeta = { text: message.content };
      }
    } catch (e) {
      currentMeta = { text: message.content };
    }

    if (newText !== undefined) {
      // Check if current user is the sender of the message
      if (message.senderId !== user.id) {
        return NextResponse.json({ error: "Only the sender can edit messages" }, { status: 403 });
      }
      currentMeta.text = newText.trim();
      currentMeta.editedAt = new Date().toISOString();
    }

    if (isPinned !== undefined) {
      currentMeta.isPinned = isPinned;
      currentMeta.pinnedAt = isPinned ? new Date().toISOString() : undefined;
      currentMeta.pinnedBy = isPinned ? user.name : undefined;
    }

    updatedContent = JSON.stringify(currentMeta);

    // Save to DB
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: updatedContent },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Broadcast update to all other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: user.id } },
      select: { userId: true }
    });
    const participantIds = otherParticipants.map(p => p.userId);
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    await broadcastToUsers(participantIds, "message:update", {
      id: messageId,
      conversationId,
      content: updatedContent,
      senderId: updatedMessage.senderId,
      senderName: updatedMessage.sender.name,
      senderImage: updatedMessage.sender.image,
      createdAt: updatedMessage.createdAt,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: {
        id: updatedMessage.id,
        content: updatedContent,
        senderId: updatedMessage.senderId,
        senderName: updatedMessage.sender.name,
        senderImage: updatedMessage.sender.image,
        isOwn: updatedMessage.senderId === user.id,
        createdAt: updatedMessage.createdAt
      }
    });
  } catch (error) {
    console.error("Error editing message:", error);
    return NextResponse.json({ error: "Failed to edit message" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check if participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: user.id }
    });

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const message = await prisma.chatMessage.findFirst({
      where: { id: messageId, conversationId }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only sender can delete messages
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "Only the sender can delete this message" }, { status: 403 });
    }

    // Delete message logic: Update content to mark as deleted for everyone
    const deletedMeta = JSON.stringify({
      text: "This message was deleted",
      deletedAt: new Date().toISOString()
    });

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content: deletedMeta }
    });

    // Broadcast delete event
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: user.id } },
      select: { userId: true }
    });
    const participantIds = otherParticipants.map(p => p.userId);
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    await broadcastToUsers(participantIds, "message:update", {
      id: messageId,
      conversationId,
      content: deletedMeta,
      senderId: message.senderId,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
