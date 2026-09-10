import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/student/recordings
 * Returns all recordings available to the logged-in student,
 * scoped to their active course enrollments.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');
    const cursor = url.searchParams.get('cursor');
    const limit = 20;

    // Get all courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.userId,
        status: 'active',
        ...(courseId ? { courseId } : {}),
      },
      select: { courseId: true }
    });

    if (enrollments.length === 0) {
      return NextResponse.json({ success: true, recordings: [], hasMore: false });
    }

    const courseIds = enrollments.map(e => e.courseId);

    // Fetch completed recordings for enrolled courses
    const recordings = await prisma.liveSession.findMany({
      where: {
        status: 'completed',
        recordingUrl: { not: null },
        lesson: {
          course: { id: { in: courseIds } }
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
                instructor: { select: { id: true, name: true } }
              }
            }
          }
        },
        // Get student's progress for this session
        attendances: {
          where: { userId: session.userId },
          select: { joinedAt: true, leftAt: true, duration: true }
        }
      },
      orderBy: { endTime: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    const hasMore = recordings.length > limit;
    const items = hasMore ? recordings.slice(0, limit) : recordings;

    return NextResponse.json({
      success: true,
      recordings: items.map(r => ({
        id: r.id,
        lessonId: r.lesson?.id,
        lessonTitle: r.lesson?.title || 'Recorded Session',
        courseId: r.lesson?.course?.id,
        courseTitle: r.lesson?.course?.title,
        instructorName: r.lesson?.course?.instructor?.name || 'Instructor',
        recordingUrl: r.recordingUrl,
        duration: r.duration,
        recordedAt: r.endTime?.toISOString() || r.startTime?.toISOString(),
        // Student's own attendance during this session
        watched: r.attendances.length > 0,
        attendanceDuration: r.attendances[0]?.duration || 0,
      })),
      hasMore,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });

  } catch (error) {
    console.error('[STUDENT_RECORDINGS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
