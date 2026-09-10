import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teacher/live-classes/[liveClassId]
 *
 * Returns details for a single live class (instructor must own it or be admin).
 */
export async function GET(
  _req: Request,
  props: { params: Promise<{ liveClassId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await props.params;
    const { liveClassId } = params;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: {
        id: true,
        courseId: true,
        teacherId: true,
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
            id: true,
            egressId: true,
            recordingStatus: true,
            driveFileId: true,
            driveViewUrl: true,
            durationSec: true,
            fileSizeBytes: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!liveClass) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');

    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, liveClass });
  } catch (error: any) {
    console.error('[teacher/live-classes/[id] GET]', error);
    return NextResponse.json({ error: 'Failed to fetch live class' }, { status: 500 });
  }
}
