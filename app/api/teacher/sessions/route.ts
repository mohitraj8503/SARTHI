import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';
import { z } from 'zod';

const sessionSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  scheduledStart: z.string().or(z.date()),
  duration: z.number().min(15),
  maxAttendees: z.number().optional().default(100),
  courseId: z.string()
});

/**
 * Teacher Live Session Engine
 * Handles scheduling, room creation, and real-time status management.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);
    const { searchParams } = new URL(request.url);
    
    console.log(`[SESSIONS] Fetching sessions for UserID: ${userId}`);
    
    // Resolve Teacher Profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    if (!teacher) {
      console.warn(`[SESSIONS] No teacher profile found for UserID: ${userId}`);
      return API.ok([]);
    }

    console.log(`[SESSIONS] Found Teacher Profile ID: ${teacher.id}`);

    const sessions = await prisma.liveSession.findMany({
      where: {
        teacherId: teacher.id,
        status: { in: ['scheduled', 'live', 'SCHEDULED', 'LIVE'] },
        startTime: { 
          gte: searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date() 
        }
      },
      include: {
        course: { select: { title: true, thumbnail: true } },
        _count: { select: { attendance: true } }
      },
      orderBy: { startTime: 'asc' }
    });
    
    console.log(`[SESSIONS] Successfully fetched ${sessions.length} sessions.`);
    return API.ok(sessions);
  } catch (err: any) {
    console.error('❌ Session GET Error:', err);
    return API.server(`Session engine failure: ${err.message || 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);
    const body = await request.json();
    const validated = sessionSchema.parse(body);
    
    // Resolve Teacher Profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    if (!teacher) return API.forbidden('Teacher profile not found');

    const startTime = new Date(validated.scheduledStart);
    const endTime = new Date(startTime.getTime() + validated.duration * 60000);
    
    const session = await prisma.liveSession.create({
      data: {
        title: validated.title,
        description: validated.description,
        startTime,
        endTime,
        durationMinutes: validated.duration,
        maxParticipants: validated.maxAttendees,
        teacherId: teacher.id,
        courseId: validated.courseId,
        meetingLink: `https://meet.sarthi-woad.vercel.app/room-${Math.random().toString(36).substring(7)}`,
        status: 'scheduled'
      },
      select: { id: true, title: true, startTime: true, meetingLink: true }
    });
    
    return API.ok(session, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return API.validation(error.errors);
    console.error('❌ Session POST Error:', error);
    return API.server('Failed to create live session');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    if (!sessionId) return API.badRequest('Session ID required');

    // Resolve Teacher Profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    if (!teacher) return API.forbidden('Teacher profile not found');

    const { action }: { action: 'start' | 'end' | 'cancel' } = await request.json();
    
    const session = await prisma.liveSession.update({
      where: { id: sessionId, teacherId: teacher.id },
      data: {
        status: action === 'start' ? 'live' : action === 'end' ? 'completed' : 'cancelled',
        actualStart: action === 'start' ? new Date() : undefined,
        actualEnd: action === 'end' ? new Date() : undefined,
        cancelledAt: action === 'cancel' ? new Date() : undefined
      }
    });
    
    // Notify WebSocket listeners if available
    if ((global as any).websocketServer) {
      (global as any).websocketServer.to(`course:${session.courseId}`).emit('session:updated', {
        sessionId: session.id,
        status: session.status
      });
    }
    
    return API.ok(session);
  } catch (err) {
    console.error('❌ Session PATCH Error:', err);
    return API.server('Failed to update session');
  }
}
