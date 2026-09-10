import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/retry-failed-recordings
 *
 * Retries Google Drive upload for LiveClass recordings stuck in FAILED state.
 * Should be called by a scheduled cron job (e.g. via Hostinger cron or GitHub Actions).
 *
 * Security: Requires CRON_SECRET header to match CRON_SECRET env var.
 * Add to cron: curl -H "x-cron-secret: $CRON_SECRET" https://sarthi-woad.vercel.app/api/cron/retry-failed-recordings
 *
 * Retry window: recordings that failed within the last 7 days and still have a tempS3Key
 * (recordings older than 7 days are assumed to have their S3 file expired via bucket lifecycle rule)
 */
export async function GET(req: Request) {
  // Simple shared-secret auth for cron endpoints
  const secret = req.headers.get('x-cron-secret');
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find FAILED recordings that still have an S3 file to retry from
  const failedRecordings = await prisma.liveClassRecording.findMany({
    where: {
      recordingStatus: 'FAILED',
      tempS3Key: { not: null },
      createdAt: { gte: sevenDaysAgo },
    },
    include: {
      liveClass: { select: { id: true, title: true } },
    },
    take: 10, // process in batches of 10 to avoid timeout
  });

  if (failedRecordings.length === 0) {
    return NextResponse.json({ success: true, retried: 0, message: 'No failed recordings to retry' });
  }

  const { uploadRecordingToDrive } = await import('@/lib/gdrive/upload');
  const results: { id: string; status: 'retried' | 'failed'; reason?: string }[] = [];

  for (const recording of failedRecordings) {
    const s3Key = recording.tempS3Key!;

    try {
      // Mark as uploading before attempting
      await prisma.liveClassRecording.update({
        where: { id: recording.id },
        data: { recordingStatus: 'UPLOADING_TO_DRIVE', failureReason: null },
      });

      const safeTitle = recording.liveClass.title.replace(/[^a-zA-Z0-9 _-]/g, '');
      const fileName = `LiveClass_${safeTitle}_retry_${new Date().toISOString()}.mp4`;

      const { driveFileId, driveViewUrl } = await uploadRecordingToDrive({ s3Key, fileName });

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

      console.log(`✅ [cron/retry] Recording ${recording.id} successfully uploaded on retry`);
      results.push({ id: recording.id, status: 'retried' });
    } catch (err: any) {
      const reason = err?.message || String(err);
      console.error(`❌ [cron/retry] Recording ${recording.id} retry failed:`, reason);

      await prisma.liveClassRecording.update({
        where: { id: recording.id },
        data: {
          recordingStatus: 'FAILED',
          failureReason: `Retry failed at ${new Date().toISOString()}: ${reason.substring(0, 1800)}`,
        },
      }).catch(() => {});

      results.push({ id: recording.id, status: 'failed', reason: reason.substring(0, 200) });
    }
  }

  return NextResponse.json({
    success: true,
    retried: results.filter((r) => r.status === 'retried').length,
    failed: results.filter((r) => r.status === 'failed').length,
    results,
  });
}
