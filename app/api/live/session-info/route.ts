import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { findSessionByAnyId } from '@/lib/session-utils';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const roomId = searchParams.get('roomId');
    const sessionId = searchParams.get('sessionId');
    const identifier = lessonId || roomId || sessionId;
    if (!identifier) {
      return NextResponse.json({ error: 'Missing roomId, lessonId, or sessionId' }, { status: 400 });
    }

    const sessionMatch = await findSessionByAnyId(identifier);

    if (!sessionMatch) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { type, data } = sessionMatch;
    
    // Check for student restriction if it's a student session
    let isRestricted = false;
    let pendingCount = 0;
    
    const courseId = type === 'lesson' ? (data as any).courseId : ((data as any).courseId || (data as any).lesson?.courseId);
    
    if (courseId && session.role !== 'TEACHER' && session.role !== 'ADMIN') {
      const enrollment = await (prisma as any).enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.userId,
            courseId
          }
        }
      });
      
      if (enrollment) {
        isRestricted = enrollment.isRestricted;
        pendingCount = enrollment.pendingAssignments;
      }
    }

    if (type === 'lesson') {
      const lessonData = data as any;
      return NextResponse.json({
        success: true,
        data: {
          id: lessonData.id,
          courseId: lessonData.courseId,
          lessonTitle: lessonData.title,
          courseName: lessonData.module?.course?.title || 'Unknown Course',
          courseSlug: lessonData.module?.course?.slug || '',
          moduleName: lessonData.module?.title || 'Unknown Module',
          description: lessonData.description,
          scheduledAt: lessonData.scheduledAt,
          liveRoomName: lessonData.liveRoomName,
          liveStatus: lessonData.liveStatus,
          recordingUrl: lessonData.videoUrl,
          isRestricted,
          pendingCount
        }
      });
    } else {
      const liveSession = data as any;
      return NextResponse.json({
        success: true,
        data: {
          id: liveSession.id,
          courseId: liveSession.courseId || liveSession.lesson?.courseId,
          lessonTitle: liveSession.lesson?.title || liveSession.title || 'Live Session',
          courseName: liveSession.lesson?.module?.course?.title || liveSession.course?.title || 'Unknown Course',
          courseSlug: liveSession.lesson?.module?.course?.slug || liveSession.course?.slug || '',
          moduleName: liveSession.lesson?.module?.title || 'Live Class',
          description: liveSession.lesson?.description || liveSession.description || '',
          scheduledAt: liveSession.startTime,
          liveRoomName: liveSession.roomId || liveSession.meetingLink,
          recordingUrl: liveSession.recordingUrl,
          googleDriveFileId: liveSession.googleDriveFileId,
          liveStatus:
            liveSession.status === 'completed'
              ? 'ENDED'
              : liveSession.status === 'live'
                ? 'LIVE'
                : 'SCHEDULED',
          isRestricted,
          pendingCount
        }
      });
    }
  } catch (error) {
    console.error('[LIVE_SESSION_INFO]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

