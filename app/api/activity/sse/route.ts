export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/activity/sse - Server-Sent Events for real-time activity updates
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!isAdmin(user)) {
      return new Response('Unauthorized - Admin access required', { status: 401 });
    }

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send initial connection message
        const sendEvent = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Send welcome event
        sendEvent({
          type: 'connected',
          timestamp: new Date().toISOString(),
          message: 'SSE connection established',
        });

        // Keep connection alive with heartbeat
        const heartbeatInterval = setInterval(() => {
          try {
            sendEvent({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            });
          } catch (e) {
            // Connection might be closed
            clearInterval(heartbeatInterval);
          }
        }, 30000); // Every 30 seconds

        // Note: In production, you would subscribe to a pub/sub system
        // like Redis Pub/Sub, PostgreSQL LISTEN/NOTIFY, or a message queue
        // to receive real-time activity updates from other parts of the system.
        // 
        // For now, we'll keep the connection open and let clients
        // poll periodically for updates or use the Activity Feed API.

        // Handle connection close
        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('[Activity SSE]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

