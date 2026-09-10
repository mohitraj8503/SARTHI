import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * Live Operations API
 * Returns all currently active live sessions with metadata for admin supervision.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active sessions with course and teacher info
    const activeSessions = await prisma.liveSession.findMany({
      where: {
        status: 'active',
        // Optional: Filter by those started within the last 4 hours to avoid stale records
        startTime: {
          gte: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
                instructor: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            attendances: true,
            messages: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    // Transform for operational dashboard
    const operationalData = activeSessions.map(s => ({
      id: s.id,
      roomName: s.roomName,
      startTime: s.startTime,
      lessonTitle: s.lesson?.title || 'Untitled Lesson',
      courseTitle: s.lesson?.course?.title || 'Untitled Course',
      teacher: s.lesson?.course?.instructor?.name || 'Unknown',
      teacherId: s.lesson?.course?.instructor?.id,
      participantCount: s._count.attendances,
      messageCount: s._count.messages,
      isRecording: s.isRecording,
      // Operational Health Logic
      healthStatus: s._count.attendances === 0 && (Date.now() - new Date(s.startTime).getTime() > 10 * 60 * 1000) 
        ? 'CRITICAL_EMPTY' 
        : 'HEALTHY'
    }));

    return NextResponse.json({ 
      success: true, 
      count: operationalData.length,
      sessions: operationalData 
    });

  } catch (error) {
    console.error('[LIVE_OPS_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Live Session Kill Switch
 * Forcefully terminates a session for moderation purposes.
 */
export async function PATCH(req: Request) {
    try {
      const session = await getSession();
      if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { sessionId, action, reason } = await req.json();
  
      if (action === 'KILL') {
        await prisma.liveSession.update({
          where: { id: sessionId },
          data: { 
            status: 'terminated',
            endTime: new Date()
          }
        });
  
        // In a real setup, we would also emit a socket event to kick everyone out
        // and notify the Jitsi/Vapi/Zoom server to end the meeting.
  
        return NextResponse.json({ success: true, message: 'Session terminated by admin override.' });
      }
  
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
