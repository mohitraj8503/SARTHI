import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/live-class/retry-upload
 *
 * Teacher-triggered retry for a FAILED LiveClass recording.
 * Requires the recording to still have a tempS3Key (i.e. the S3 file hasn't expired).
 *
 * Body: { liveClassId }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { liveClassId } = await req.json();
    if (!liveClassId) {
      return NextResponse.json({ error: 'liveClassId is required' }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: {
        id: true,
        teacherId: true,
        title: true,
        recording: {
          select: {
            id: true,
            recordingStatus: true,
            tempS3Key: true,
            failureReason: true,
          },
        },
      },
    });

    if (!liveClass) {
      return NextResponse.json({ error: 'Live class not found' }, { status: 404 });
    }

    // Auth: only the teacher who owns the class (or admin) can retry
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');
    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recording = liveClass.recording;
    if (!recording) {
      return NextResponse.json({ error: 'No recording found for this class' }, { status: 404 });
    }

    if (recording.recordingStatus === 'READY') {
      return NextResponse.json({ error: 'Recording is already ready', status: 'READY' }, { status: 409 });
    }

    if (recording.recordingStatus === 'UPLOADING_TO_DRIVE') {
      return NextResponse.json({ error: 'Upload already in progress', status: 'UPLOADING_TO_DRIVE' }, { status: 409 });
    }

    if (!recording.tempS3Key) {
      return NextResponse.json(
        { error: 'Temp S3 file no longer available (may have expired via lifecycle rule). Cannot retry.' },
        { status: 422 }
      );
    }

    // Mark as uploading before starting the async job
    await prisma.liveClassRecording.update({
      where: { id: recording.id },
      data: { recordingStatus: 'UPLOADING_TO_DRIVE', failureReason: null },
    });

    // Fire-and-forget upload (same pattern as the webhook)
    (async () => {
      try {
        const { uploadRecordingToDrive } = await import('@/lib/gdrive/upload');
        const safeTitle = liveClass.title.replace(/[^a-zA-Z0-9 _-]/g, '');
        const fileName = `LiveClass_${safeTitle}_retry_${new Date().toISOString()}.mp4`;

        const { driveFileId, driveViewUrl } = await uploadRecordingToDrive({
          s3Key: recording.tempS3Key!,
          fileName,
        });

        await prisma.liveClassRecording.update({
          where: { id: recording.id },
          data: {
            recordingStatus: 'READY',
            driveFileId,
            driveViewUrl,
            uploadedAt: new Date(),
            tempS3Key: null,
            failureReason: null,
          },
        });

        console.log(`✅ [retry-upload] Recording ${recording.id} successfully uploaded on manual retry`);
      } catch (err: any) {
        const reason = err?.message || String(err);
        console.error(`❌ [retry-upload] Recording ${recording.id} retry failed:`, reason);
        await prisma.liveClassRecording.update({
          where: { id: recording.id },
          data: {
            recordingStatus: 'FAILED',
            failureReason: `Manual retry failed at ${new Date().toISOString()}: ${reason.substring(0, 1800)}`,
          },
        }).catch(() => {});
      }
    })();

    return NextResponse.json({
      success: true,
      message: 'Upload retry started. Refresh in a few minutes to see the result.',
    });
  } catch (error: any) {
    console.error('[live-class/retry-upload]', error);
    return NextResponse.json({ error: 'Failed to initiate retry', details: error?.message }, { status: 500 });
  }
}
