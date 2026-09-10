import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import Redis from 'ioredis';

// Redis client instantiation removed to prevent startup errors if Redis is missing.
// We instantiate inside the handler if needed.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !session.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!process.env.REDIS_URL) {
        console.warn('[API] Realtime disabled: REDIS_URL not set');
        // Return a dummy stream to keep frontend happy
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode('data: {"type": "connected", "warning": "realtime_disabled"}\n\n'));
                // Keep connection open and send keep-alive every 15s to prevent timeouts
                const interval = setInterval(() => {
                    try {
                        controller.enqueue(encoder.encode(': keep-alive\n\n'));
                    } catch (err) {
                        // Stream controller might be closed
                    }
                }, 15000);
                req.signal.addEventListener('abort', () => clearInterval(interval));
            }
        });
        return new NextResponse(stream, {
            headers: { 
              'Content-Type': 'text/event-stream', 
              'Cache-Control': 'no-cache', 
              'Connection': 'keep-alive' 
            }
        });
    }

    // In a real app, verify they are an instructor
    const userId = session.id;
    const channel = `instructor:${userId}:events`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const localSub = new Redis(process.env.REDIS_URL!);
        
        try {
            await localSub.subscribe(channel);
            
            localSub.on('message', (chan, message) => {
                if (chan === channel) {
                    const data = `data: ${message}\n\n`;
                    controller.enqueue(encoder.encode(data));
                }
            });

            // Send initial connection message
            controller.enqueue(encoder.encode('data: {"type": "connected"}\n\n'));

            // Keep-alive to prevent timeout
            const interval = setInterval(() => {
                controller.enqueue(encoder.encode(': keep-alive\n\n'));
            }, 15000);

            // Cleanup on close
            req.signal.addEventListener('abort', () => {
                clearInterval(interval);
                localSub.quit();
            });

        } catch (err) {
            console.error('Redis sub error:', err);
            controller.error(err);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[API] Realtime Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

