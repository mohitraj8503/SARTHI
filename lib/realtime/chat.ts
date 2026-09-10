import { Socket, Server } from 'socket.io';
import { prisma } from '../prisma';

/**
 * Intelligent Chat Persistence Engine
 * Saves every message to the database for historical audit and cross-session persistence.
 */
export async function setupChatPersistence(socket: Socket, io: Server) {
  socket.on('chat:send', async (data: { content: string; sessionId?: string; courseId?: string }) => {
    const userId = (socket as any).userId; // Assuming userId is attached to socket
    if (!userId || !data.content) return;
    
    try {
      // 1. Persist to Database
      const message = await prisma.chatMessage.create({
        data: {
          content: data.content.trim(),
          senderId: userId,
          sessionId: data.sessionId,
          courseId: data.courseId
        },
        include: { sender: { select: { name: true, avatar_url: true } } }
      });
      
      // 2. Broadcast to appropriate room
      const room = data.sessionId ? `session:${data.sessionId}` : `course:${data.courseId}`;
      io.to(room).emit('chat:message', {
        id: message.id,
        content: message.content,
        sender: {
          name: message.sender.name,
          avatar: message.sender.avatar_url
        },
        createdAt: message.createdAt
      });
      
    } catch (err) {
      console.error('Chat Persistence Error:', err);
    }
  });

  // Load history on request
  socket.on('chat:load_history', async (params: { sessionId?: string; courseId?: string }) => {
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: params.sessionId,
        courseId: params.courseId
      },
      include: { sender: { select: { name: true, avatar_url: true } } },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
    
    socket.emit('chat:history', messages.map(m => ({
      id: m.id,
      content: m.content,
      sender: {
        name: m.sender.name,
        avatar: m.sender.avatar_url
      },
      createdAt: m.createdAt
    })));
  });
}
