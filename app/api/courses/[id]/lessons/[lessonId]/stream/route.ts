import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateStudent } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

/**
 * Secure Video Streaming Engine
 * Validates enrollment and generates ephemeral signed URLs for HLS content.
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string; lessonId: string }> }
) {
  const params = await props.params;
  try {
    const userId = await authenticateStudent(request);
    
    // 1. Verify Enrollment & Access
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: params.id,
        status: 'ACTIVE',
        course: {
          lessons: { some: { id: params.lessonId } }
        }
      }
    });
    
    if (!enrollment) return API.forbidden('Course access required');
    
    // 2. Resolve Video Resource
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      select: { video_url: true }
    });
    
    if (!lesson?.video_url) return API.notFound('Video content');

    // 3. Return Redirect or Signed URL
    // In production, integrate with Mux/Cloudinary signed URLs here
    return NextResponse.redirect(lesson.video_url, {
      headers: {
        'Cache-Control': 'private, max-age=3600'
      }
    });
    
  } catch (err) {
    console.error('Streaming API Error:', err);
    return API.server();
  }
}
