import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { stopRoomRecording } from '@/lib/livekit/egress';

/**
 * POST /api/live-class/end
 *
 * Instructor ends the live class:
 *   1. Stops the LiveKit egress (triggers LiveKit to finalize + upload to S3)
 *   2. Marks the class as ENDED
 *
 * The actual Drive upload happens asynchronously via the LiveKit webhook
 * (POST /api/livekit/webhook) once LiveKit fires the egress_ended event.
 *
 * Body: { liveClassId }
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
        teacherId: true,
        liveKitStatus: true,
        recording: { select: { id: true, egressId: true } },
      },
    });

    if (!liveClass) {
      return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
    }

    // Auth check
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const isAdmin =
      user?.role === 'ADMIN' ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'GOD_ADMIN';

    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Only the class instructor can end this class' }, { status: 403 });
    }

    if (liveClass.liveKitStatus === 'ENDED') {
      return NextResponse.json({ error: 'Class has already ended' }, { status: 409 });
    }

    // ── 1. Stop egress (non-fatal) ─────────────────────────────────────────
    const egressId = liveClass.recording?.egressId;
    if (egressId) {
      try {
        await stopRoomRecording(egressId);
        console.log(`[live-class/end] Stopped egress ${egressId}`);
      } catch (egressErr: any) {
        // Egress may have already stopped if room was empty; don't fail the request
        console.warn('[live-class/end] stopRoomRecording failed (may already be stopped):', egressErr?.message);
      }
    } else {
      console.warn(`[live-class/end] No egressId found for class ${liveClassId} — recording may not have been started`);
    }

    // ── 2. Mark class as ENDED ─────────────────────────────────────────────
    const updatedClass = await prisma.liveClass.update({
      where: { id: liveClassId },
      data: {
        liveKitStatus: 'ENDED',
        liveKitEndedAt: new Date(),
        endedAt: new Date(),
        status: 'ENDED' as any,
      },
    });

    return NextResponse.json({
      success: true,
      liveClass: updatedClass,
      message: egressId
        ? 'Class ended. Recording will be uploaded to Google Drive shortly.'
        : 'Class ended. No recording was in progress.',
    });
  } catch (error: any) {
    console.error('[live-class/end]', error);
    return NextResponse.json({ error: 'Failed to end live class', details: error?.message }, { status: 500 });
  }
}
