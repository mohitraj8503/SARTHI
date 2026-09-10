import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { startRoomRecording } from '@/lib/livekit/egress';

/**
 * POST /api/live-class/start
 *
 * Instructor marks the live class as LIVE and starts S3-backed egress recording.
 * Body: { liveClassId }
 * Returns: { egressId, liveClass }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { liveClassId } = body;

    if (!liveClassId) {
      return NextResponse.json({ error: 'liveClassId is required' }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: {
        id: true,
        courseId: true,
        teacherId: true,
        roomName: true,
        liveKitStatus: true,
        recording: { select: { id: true, egressId: true } },
      },
    });

    if (!liveClass) {
      return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
    }

    // Only the owning teacher (or admin) may start the class
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const isAdmin =
      user?.role === 'ADMIN' ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'GOD_ADMIN';

    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Only the class instructor can start this class' }, { status: 403 });
    }

    if (!liveClass.roomName) {
      return NextResponse.json({ error: 'This class has no LiveKit room configured' }, { status: 400 });
    }

    if (liveClass.liveKitStatus === 'LIVE') {
      return NextResponse.json({ error: 'Class is already live', egressId: liveClass.recording?.egressId }, { status: 409 });
    }

    // ── 1. Mark the class as LIVE ───────────────────────────────────────────
    const updatedClass = await prisma.liveClass.update({
      where: { id: liveClassId },
      data: {
        liveKitStatus: 'LIVE',
        liveKitStartedAt: new Date(),
        startedAt: new Date(),
        status: 'LIVE' as any,
      },
    });

    // ── 2. Start S3-backed egress recording (if RECORDING_ENABLED is true) ──
    let egressId: string | null = null;
    const isRecordingEnabled = process.env.RECORDING_ENABLED === 'true';

    if (isRecordingEnabled) {
      try {
        const egress = await startRoomRecording(liveClass.roomName, liveClassId);
        egressId = egress.egressId;

        // ── 3. Create or update LiveClassRecording row ─────────────────────
        await prisma.liveClassRecording.upsert({
          where: { liveClassId },
          create: {
            liveClassId,
            courseId: liveClass.courseId,
            egressId,
            recordingStatus: 'PROCESSING',
          },
          update: {
            egressId,
            recordingStatus: 'PROCESSING',
            driveFileId: null,
            driveViewUrl: null,
            uploadedAt: null,
          },
        });

        console.log(`[live-class/start] Recording started for class ${liveClassId}, egressId: ${egressId}`);
      } catch (egressErr: any) {
        console.error('[live-class/start] Egress start failed (class marked LIVE but not recording):', egressErr);
      }
    } else {
      console.log(`[live-class/start] Recording is disabled (RECORDING_ENABLED != 'true'). Skipping Egress.`);
    }

    return NextResponse.json({
      success: true,
      liveClass: updatedClass,
      egressId,
      recording: egressId ? 'started' : 'failed_to_start',
    });
  } catch (error: any) {
    console.error('[live-class/start]', error);
    return NextResponse.json({ error: 'Failed to start live class', details: error?.message }, { status: 500 });
  }
}
