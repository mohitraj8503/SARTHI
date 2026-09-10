import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EventEmitter } from 'events';

// Global emitter for notifications
const notificationEmitter = new EventEmitter();
notificationEmitter.setMaxListeners(1000); // Allow many students

export function emitNotification(userId: string, data: any) {
  notificationEmitter.emit(`notification:${userId}`, data);
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.userId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const listener = (data: any) => {
        const event = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      notificationEmitter.on(`notification:${userId}`, listener);

      // Keep-alive ping every 30s
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 30000);

      req.signal.addEventListener('abort', () => {
        notificationEmitter.off(`notification:${userId}`, listener);
        clearInterval(keepAlive);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

