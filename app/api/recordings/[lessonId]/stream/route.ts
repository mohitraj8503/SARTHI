import { NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/services/google-drive';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/recordings/[lessonId]/stream
 * Securely streams a class recording from Google Drive to the client.
 */
export async function GET(request: Request, props: { params: Promise<{ lessonId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const lessonId = params.lessonId;

    // 1. Fetch lesson info to get drive_file_id (stored in videoUrl)
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true }
    });

    if (!lesson || !lesson.videoUrl) {
      return new Response('Recording not found', { status: 404 });
    }

    // 2. Permission Check (Check if enrolled)
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: lesson.module?.courseId || ''
        }
      }
    });

    if (!enrollment && session.role !== 'TEACHER' && session.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    // 3. Get stream from Google Drive
    const stream = await GoogleDriveService.getFileStream(lesson.videoUrl);

    // 4. Return stream response
    // Note: In a production environment, you might need to handle 206 Partial Content for seeking.
    // For this implementation, we provide a basic stream proxy.
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'video/mp4',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error: any) {
    console.error('[API/Recordings/Stream] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
