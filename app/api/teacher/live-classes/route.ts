import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teacher/live-classes
 *
 * Returns all LiveKit-enabled live classes created by the authenticated instructor,
 * ordered by most recently created.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const liveClasses = await prisma.liveClass.findMany({
      where: {
        teacherId: session.userId,
        roomName: { not: null }, // LiveKit classes only
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        description: true,
        scheduledAt: true,
        status: true,
        liveKitStatus: true,
        liveKitStartedAt: true,
        liveKitEndedAt: true,
        roomName: true,
        createdAt: true,
        course: { select: { title: true } },
        recording: {
          select: {
            recordingStatus: true,
            driveFileId: true,
            driveViewUrl: true,
            durationSec: true,
            failureReason: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, liveClasses });
  } catch (error: any) {
    console.error('[teacher/live-classes GET]', error);
    return NextResponse.json({ error: 'Failed to fetch live classes' }, { status: 500 });
  }
}
