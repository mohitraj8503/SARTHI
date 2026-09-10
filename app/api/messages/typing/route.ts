export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/messaging/auth";

// Store typing status
const typingUsers = new Map<string, { conversationId: string; timestamp: number }>();

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { conversationId, isTyping } = await request.json();

  if (!conversationId) {
    return new Response("Conversation ID required", { status: 400 });
  }

  if (isTyping) {
    typingUsers.set(user.id, { conversationId, timestamp: Date.now() });

    // BROADCAST REAL-TIME TYPING SIGNAL
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    const { prisma } = await import("@/lib/prisma");
    
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: user.id },
      },
      select: { userId: true }
    });

    await broadcastToUsers(otherParticipants.map(p => p.userId), "typing", {
      conversationId,
      userId: user.id,
      isTyping: true
    });

    // Auto-clear typing status after 5 seconds
    setTimeout(() => {
      const current = typingUsers.get(user.id);
      if (current && current.conversationId === conversationId) {
        typingUsers.delete(user.id);
      }
    }, 5000);
  } else {
    typingUsers.delete(user.id);
    
    // Broadcast stop typing
    const { broadcastToUsers } = await import("@/lib/messaging/sse");
    const { prisma } = await import("@/lib/prisma");
    const otherParticipants = await prisma.conversationParticipant.findMany({
        where: { conversationId, userId: { not: user.id } },
        select: { userId: true }
    });
    await broadcastToUsers(otherParticipants.map(p => p.userId), "typing", {
        conversationId,
        userId: user.id,
        isTyping: false
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");

  if (!conversationId) {
    return new Response("Conversation ID required", { status: 400 });
  }

  // Get users typing in this conversation
  const typing: string[] = [];
  for (const [userId, data] of typingUsers.entries()) {
    if (data.conversationId === conversationId && userId !== user.id) {
      typing.push(userId);
    }
  }

  return new Response(JSON.stringify({ typing }), {
    headers: { "Content-Type": "application/json" },
  });
}

