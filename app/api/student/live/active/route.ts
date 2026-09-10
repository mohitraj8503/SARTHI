import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateStudent } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

// GET /api/student/live/active?courseId=XYZ
// Find if there is an active live class for the given course
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateStudent(request);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return ApiResponse.error('Course ID is required', 'VALIDATION_ERROR', 400);
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId, status: 'active' }
    });

    if (!enrollment) {
      return ApiResponse.error('Unauthorized or not enrolled', 'UNAUTHORIZED', 403);
    }

    const activeClass = await prisma.liveClass.findFirst({
      where: {
        courseId,
        status: 'LIVE'
      },
      select: {
        id: true,
        title: true,
        description: true,
        youtubeVideoId: true,
        startedAt: true
      }
    });

    return ApiResponse.success({ activeClass });
  } catch (error: any) {
    return handleApiError(error);
  }
}
