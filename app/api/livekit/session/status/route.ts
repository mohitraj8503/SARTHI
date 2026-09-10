import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { findSessionByAnyId } from '@/lib/session-utils';

/**
 * Session Lifecycle API
 * Allows teachers to manually start/end classes
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    });
    if (!teacher) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { roomName, status, lessonId } = await req.json();
    if (!roomName || !status) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    // 2. Handle curriculum-integrated lesson if lessonId maps to an actual lesson
    if (lessonId) {
      const lessonUpdate = await prisma.lesson.updateMany({
        where: { id: lessonId },
        data: {
          liveStatus: status === 'live' ? 'LIVE' : status === 'completed' ? 'ENDED' : 'SCHEDULED'
        }
      });

      // Emit notifications to all enrolled students if going LIVE
      if (status === 'live' && lessonUpdate.count > 0) {
         const { onClassStarted } = await import('@/lib/notifications/orchestrator');
         onClassStarted(lessonId).catch(console.error);
      }
    }

    // 3. Robust lookup for LiveSession record (handles curriculum lessons too)
    const sessionMatch = await findSessionByAnyId(lessonId || roomName);

    if (sessionMatch) {
      const updateData: any = { status };
      
      if (status === 'live' && !(sessionMatch.data as any).actualStart) {
        updateData.actualStart = new Date();
      }
      
      if (status === 'completed') {
        updateData.actualEnd = new Date();
      }

      const table = sessionMatch.type === 'liveSession' ? 'liveSession' : 'liveSession'; // Both use liveSession table for this logic
      
      // If it's a lesson match, find the linked LiveSession
      let targetId: string | null = null;
      if (sessionMatch.type === 'liveSession') {
        targetId = (sessionMatch.data as any).id;
      } else {
        const liveSession = await prisma.liveSession.findFirst({
          where: { 
            OR: [
              { lessonId: (sessionMatch.data as any).id },
              { roomId: roomName }
            ]
          }
        });
        targetId = liveSession?.id || null;
      }

      if (targetId) {
        await prisma.liveSession.update({
          where: { id: targetId },
          data: updateData
        });
      }
    }

    console.log(`✅ Session status updated to ${status} (Room: ${roomName}, Lesson: ${lessonId || 'N/A'})`);
    return NextResponse.json({ success: true });


  } catch (error: any) {
    console.error('❌ Session Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

