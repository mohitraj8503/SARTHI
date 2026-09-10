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
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
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

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Update unread count for other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: user.id },
      },
    });

    for (const p of otherParticipants) {
      await prisma.conversationParticipant.update({
        where: { id: p.id },
        data: {
          unreadCount: p.unreadCount + 1,
        },
      });
    }

    // BROADCAST REAL-TIME SIGNAL
    const participantIds = otherParticipants.map(p => p.userId);
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    
    await broadcastToUsers(participantIds, "message:new", {
      id: message.id,
      conversationId,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderImage: message.sender.image,
      createdAt: message.createdAt,
      isRead: false
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderName: message.sender.name,
          senderImage: message.sender.image,
          isOwn: true,
          isRead: message.isRead,
          createdAt: message.createdAt,
          reactions: []
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(
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
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before");

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

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId,
        ...(before
          ? {
              createdAt: {
                lt: new Date(before),
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
    });

    // Format messages
    const formattedMessages = messages.reverse().map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderImage: m.sender.image,
      isOwn: m.senderId === user.id,
      isRead: m.isRead,
      createdAt: m.createdAt,
      reactions: m.reactions.map(r => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        type: r.type
      }))
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
