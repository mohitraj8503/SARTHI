export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getSession();
    const userRole = (session?.role || '').toUpperCase();
    if (!session?.userId || userRole !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized - Teacher access required' }, { status: 403 });
    }

    const teacherId = session.userId;
    const { courseId } = await params;

    // Verify course ownership
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: teacherId,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
    }

    // Fetch videos for the course
    const videos = await prisma.video.findMany({
      where: {
        course_id: courseId,
        teacher_id: teacherId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        uploaded_at: 'desc',
      },
    });

    // Transform videos to include YouTube URL
    const transformedVideos = videos.map(video => ({
      id: video.id,
      youtube_video_id: video.youtube_video_id,
      youtube_url: `https://www.youtube.com/watch?v=${video.youtube_video_id}`,
      privacy_status: video.privacy_status,
      duration: video.duration,
      uploaded_at: video.uploaded_at,
      status: video.status,
      teacher: video.teacher,
    }));

    return NextResponse.json({ videos: transformedVideos });

  } catch (error: any) {
    console.error('[VideosList] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
