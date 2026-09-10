import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/courses/[courseId]/live-classes/[liveClassId]
 *
 * Returns public-safe live class details for enrolled students.
 * Includes recording info once READY.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string; liveClassId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId, liveClassId } = params;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
      select: { status: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    const isTeacherOrAdmin = ['TEACHER', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');

    if (!isTeacherOrAdmin && (!enrollment || enrollment.status.toLowerCase() !== 'active')) {
      return NextResponse.json({ error: 'Enrollment required' }, { status: 403 });
    }

    const liveClass = await prisma.liveClass.findFirst({
      where: { id: liveClassId, courseId },
      select: {
        id: true,
        courseId: true,
        title: true,
        description: true,
        scheduledAt: true,
        liveKitStatus: true,
        status: true,
        createdAt: true,
        recording: {
          select: {
            recordingStatus: true,
            driveFileId: true,
            driveViewUrl: true,
            durationSec: true,
          },
        },
      },
    });

    if (!liveClass) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, liveClass });
  } catch (error: any) {
    console.error('[courses/[courseId]/live-classes/[liveClassId] GET]', error);
    return NextResponse.json({ error: 'Failed to fetch live class' }, { status: 500 });
  }
}
