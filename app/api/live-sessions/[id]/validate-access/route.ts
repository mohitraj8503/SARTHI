import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ allowed: false, reason: 'unauthorized', message: 'You must be logged in to join' }, { status: 401 });
    }

    const liveSessionId = params.id;
    
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
      include: {
        course: {
          include: {
            enrollments: {
              where: { userId: session.userId, status: 'active' }
            }
          }
        },
        linkedLesson: true
      }
    });

    if (!liveSession) {
      return NextResponse.json({ allowed: false, reason: 'not_found', message: 'Live session not found' }, { status: 404 });
    }

    // 1. Check Enrollment
    const isEnrolled = liveSession.course.enrollments.length > 0;
    const isPublic = liveSession.privacy === 'public';
    const isTeacher = liveSession.teacherId === session.userId || (liveSession.course as any).instructorId === session.userId;
    
    if (!isEnrolled && !isPublic && !isTeacher) {
      return NextResponse.json({ 
        allowed: false, 
        reason: 'not_enrolled', 
        message: 'Access denied: You must be enrolled in this course',
        courseId: liveSession.courseId 
      });
    }

    // 2. Check Prerequisites (If implemented later with prerequisites array)
    // For now, we allow access if enrolled since prerequisite structure is complex
    
    // 3. Check Time Window
    // Allow join 15 min before to 30 min after start
    const now = new Date();
    const earliestJoin = new Date(liveSession.startTime.getTime() - 15 * 60000);
    const latestJoin = new Date(liveSession.endTime.getTime() + 30 * 60000);
    
    // Bypass time check for teachers
    if (!isTeacher && (now < earliestJoin || now > latestJoin)) {
      return NextResponse.json({ 
        allowed: false, 
        reason: 'outside_window', 
        message: 'Live session is not currently accessible' 
      });
    }

    // Validation successful
    return NextResponse.json({ 
      allowed: true,
      roomId: liveSession.roomId,
      courseId: liveSession.courseId,
      lessonId: liveSession.lessonId,
      orderNumber: liveSession.orderNumber,
      sessionTitle: liveSession.title,
      // Provide waiting room config if needed
      waitingRoomRequired: false 
    });

  } catch (error) {
    console.error('[LIVE_SESSION_VALIDATE]', error);
    return NextResponse.json({ allowed: false, reason: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
