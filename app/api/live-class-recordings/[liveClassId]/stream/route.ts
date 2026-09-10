import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getDriveClient } from '@/lib/gdrive/client';

/**
 * GET /api/recordings/[liveClassId]/stream
 *
 * Authenticated Drive recording proxy.
 * Streams the recording video through the server, validating enrollment before serving.
 *
 * This keeps Drive files PRIVATE (no "anyone with link" permission needed).
 * Use this endpoint as the <video> src or as the iframe target instead of the raw Drive link.
 *
 * Security:
 *  - Must be authenticated (session required)
 *  - Students must be actively enrolled in the course
 *  - Teachers and admins bypass enrollment check
 *  - Recording must be in READY status
 *
 * Usage: <video src="/api/recordings/{liveClassId}/stream" controls />
 *
 * Note: For very large recordings (> 1–2 GB), consider instead generating a
 * short-lived download URL via the Drive API's media download endpoint with
 * the service account token — this avoids buffering through the Next.js server.
 */
export async function GET(
  req: Request,
  { params }: { params: { liveClassId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { liveClassId } = params;

    // Fetch recording + course info
    const recording = await prisma.liveClassRecording.findUnique({
      where: { liveClassId },
      select: {
        id: true,
        recordingStatus: true,
        driveFileId: true,
        courseId: true,
        liveClass: { select: { teacherId: true } },
      },
    });

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    if (recording.recordingStatus !== 'READY' || !recording.driveFileId) {
      return NextResponse.json(
        { error: 'Recording is not ready yet. Check back in a few minutes.' },
        { status: 404 }
      );
    }

    // Access control
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');
    const isTeacher = recording.liveClass.teacherId === session.userId;

    if (!isAdmin && !isTeacher) {
      // Check active enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.userId, courseId: recording.courseId } },
        select: { status: true },
      });
      if (!enrollment || enrollment.status.toLowerCase() !== 'active') {
        return NextResponse.json({ error: 'Enrollment required to watch this recording' }, { status: 403 });
      }
    }

    // Stream from Drive using service account
    const drive = getDriveClient();

    // Handle Range header for seekable video
    const rangeHeader = req.headers.get('range');

    const driveResp = await drive.files.get(
      { fileId: recording.driveFileId, alt: 'media' },
      {
        responseType: 'stream',
        headers: rangeHeader ? { Range: rangeHeader } : {},
      }
    );

    const stream = driveResp.data as any;
    const headers: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
    };

    // Forward content range/length headers from Drive
    if (driveResp.headers['content-length']) {
      headers['Content-Length'] = driveResp.headers['content-length'] as string;
    }
    if (driveResp.headers['content-range']) {
      headers['Content-Range'] = driveResp.headers['content-range'] as string;
    }

    const status = rangeHeader ? 206 : 200;

    return new Response(stream, { status, headers });
  } catch (error: any) {
    console.error('[recordings/stream]', error?.message);
    return NextResponse.json({ error: 'Failed to stream recording' }, { status: 500 });
  }
}
