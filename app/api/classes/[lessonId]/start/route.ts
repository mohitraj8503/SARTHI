import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { ClassroomEmitter } from '@/lib/realtime/classroom/classroom-emitter';
import { ClassroomEventType, SessionState } from '@/lib/realtime/classroom/types';

/**
 * Robust Classroom Lifecycle - START
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    let session = await getSession();
    const isDev = process.env.NODE_ENV !== 'production';
    if (!session && isDev) {
      session = {
        id: 'mock-session-id',
        userId: 'mock-user-id',
        role: 'TEACHER',
        email: 'teacher@sarthi-woad.vercel.app',
        name: 'Mohit Raj'
      };
    } else if (session && session.role !== 'TEACHER' && session.role !== 'ADMIN' && isDev) {
      session.role = 'TEACHER';
    }

    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await params;

    // 1. Find the lesson and its associated live session
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { 
        liveSession: true,
        course: {
          select: { id: true, title: true }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // 2. Update Lesson and LiveSession status
    const now = new Date();
    await prisma.$transaction([
      prisma.lesson.update({
        where: { id: lessonId },
        data: { liveStatus: 'LIVE' }
      }),
      ...(lesson.liveSessionId ? [
        prisma.liveSession.update({
          where: { id: lesson.liveSessionId },
          data: { 
            status: SessionState.LIVE,
            actualStart: now
          }
        })
      ] : [])
    ]);

    // 3. Emit Realtime Event
    ClassroomEmitter.notifyClassLive(
      lessonId,
      lesson.courseId,
      lesson.liveRoomName || `lesson_${lessonId}`,
      session.userId
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Classroom is now LIVE',
      data: {
        startTime: now,
        roomName: lesson.liveRoomName
      }
    });

  } catch (error) {
    console.error('[CLASSROOM_START]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
