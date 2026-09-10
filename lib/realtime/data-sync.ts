import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma';

/**
 * High-Performance Real-Time Synchronization Engine
 * Handles cross-dashboard data propagation and role-based room management.
 */
export class DataSyncService {
  private static io: Server;
  
  static initialize(httpServer: any) {
    if (this.io) return this.io;

    this.io = new Server(httpServer, {
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL || '*' },
      path: '/api/socket',
    });
    
    this.io.on('connection', (socket: Socket) => {
      console.log('📡 New Real-Time Connection:', socket.id);

      socket.on('join:course', (courseId: string) => {
        socket.join(`course:${courseId}`);
      });

      socket.on('join:user', (userId: string) => {
        socket.join(`user:${userId}`);
      });

      // Handle Teacher Action -> Student Broadcast
      socket.on('course:update', async (data: { courseId: string, payload: any }) => {
        // Broadcast to all students in the course room
        this.io.to(`course:${data.courseId}`).emit('course:changed', data.payload);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Connection Terminated:', socket.id);
      });
    });
    
    return this.io;
  }
  
  static emitToUser(userId: string, event: string, data: any) {
    this.io?.to(`user:${userId}`).emit(event, data);
  }
  
  static emitToCourse(courseId: string, event: string, data: any) {
    this.io?.to(`course:${courseId}`).emit(event, data);
  }
}
