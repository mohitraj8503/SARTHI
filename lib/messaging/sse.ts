import { getIO } from '@/lib/realtime/socket-server';

// Store active connections
// Note: In a real production environment with multiple server instances, 
// you would use Redis Pub/Sub instead of an in-memory Map.
export const connections = new Map<string, Set<any>>();

// Function to send a message to a specific user
export async function sendToUser(userId: string, event: string, data: any) {
    // 1. Send via SSE if connection exists
    const userConnections = connections.get(userId);
    if (userConnections) {
        const encoder = new TextEncoder();
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

        for (const controller of userConnections) {
            try {
                controller.enqueue(encoder.encode(message));
            } catch {
                // Connection might be closed
            }
        }
    }

    // 2. Fallback: Send via Socket.IO
    try {
        const io = getIO();
        if (io) {
            io.to(`user:${userId}`).emit(event, data);
        }
    } catch (error) {
        console.error('[SSE-Fallback] Failed to emit via Socket.IO:', error);
    }
}

// Function to broadcast to multiple users
export async function broadcastToUsers(userIds: string[], event: string, data: any) {
    await Promise.all(userIds.map(userId => sendToUser(userId, event, data)));
}
