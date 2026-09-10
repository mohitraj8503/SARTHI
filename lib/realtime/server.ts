import { Server } from 'socket.io';
import { prisma } from '../prisma';
import * as jose from 'jose';

/**
 * Enterprise Real-time Event Engine
 * Handles role-based broadcasting and live data synchronization.
 */
export function setupRealtimeServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { 
      origin: process.env.NEXT_PUBLIC_APP_URL || '*', 
      methods: ['GET', 'POST'] 
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Attach to global for access from API routes
  (global as any).websocketServer = io;

  io.on('connection', (socket) => {
    console.log('⚡ WS Connection:', socket.id);

    socket.on('authenticate', async (token: string) => {
      try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback_secret');
        const { payload } = await jose.jwtVerify(token, secret);
        
        socket.data.userId = payload.userId;
        socket.data.role = payload.role;
        
        // Join role-specific room (e.g., teacher:123, student:456)
        socket.join(`${payload.role.toLowerCase()}:${payload.userId}`);
        
        console.log(`🔐 WS Authenticated: ${payload.role} (${payload.userId})`);
        socket.emit('authenticated', { success: true });
      } catch (err) {
        console.error('❌ WS Auth Failed:', err);
        socket.disconnect();
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WS Disconnected:', socket.id);
    });
  });

  return io;
}

/**
 * Helper to notify a specific user
 */
export function notifyUser(userId: string, role: string, event: string, data: any) {
  const io = (global as any).websocketServer;
  if (io) {
    io.to(`${role.toLowerCase()}:${userId}`).emit(event, data);
  }
}
