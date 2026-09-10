export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/messaging/auth";
import { connections } from "@/lib/messaging/sse";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to the user's channel
      const userConnections = connections.get(user.id) || new Set();
      userConnections.add(controller);
      connections.set(user.id, userConnections);

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId: user.id })}\n\n`)
      );

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        const userConns = connections.get(user.id);
        if (userConns) {
          userConns.delete(controller);
          if (userConns.size === 0) {
            connections.delete(user.id);
          }
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

