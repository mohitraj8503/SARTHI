import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/classes/[lessonId]/end
 * Triggered when a live class ends. 
 * Auto-releases assignments and updates student restrictions.
 */
export async function POST(
  request: Request,
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
    }

    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { lessonId } = await params;

    // 1. Find the assignment linked to this lesson
    const assignment = await prisma.assignment.findFirst({
      where: { 
        lessonId,
        status: 'READY',
        releaseMode: 'AUTO_AFTER_CLASS'
      }
    });

    if (!assignment) {
      return NextResponse.json({ 
        success: true, 
        message: 'No READY assignment found for auto-release.' 
      });
    }

    // 2. Release the assignment
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { 
        status: 'RELEASED',
        releaseAt: new Date()
      }
    });

    // 3. Update student restrictions for all enrolled students in this course
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: assignment.courseId || '' }
    });

    // Bulk update enrollments (Prisma doesn't support bulk update with logic easily, so we loop or use raw SQL)
    // For production, a background worker would handle this.
    await prisma.$transaction(
      enrollments.map(enrollment => 
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            pendingAssignments: { increment: 1 },
            isRestricted: true
          }
        })
      )
    );

    // 4. Update Lesson & LiveSession status
    await prisma.$transaction([
      prisma.lesson.update({
        where: { id: lessonId },
        data: { liveStatus: 'ENDED' }
      }),
      prisma.liveSession.updateMany({
        where: { lessonId: lessonId },
        data: { 
          status: 'completed',
          actualEnd: new Date()
        }
      })
    ]);

    // 5. Emit Realtime Event
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, liveRoomName: true }
    });

    if (lesson) {
      ClassroomEmitter.emit(ClassroomEventType.CLASS_ENDED, {
        lessonId,
        courseId: lesson.courseId,
        roomName: lesson.liveRoomName || '',
        timestamp: new Date().toISOString()
      }, session.userId);
    }

    return NextResponse.json({
      success: true,
      message: `Class ended. Assignment "${assignment.title}" released. ${enrollments.length} students restricted until completion.`
    });
  } catch (error: any) {
    console.error('[API/Classes/End] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
