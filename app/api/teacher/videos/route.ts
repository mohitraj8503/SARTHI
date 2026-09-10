import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/videos
 * Fetch all course-linked videos for the teacher's vault.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    // Fetch lessons that are videos for this teacher's courses
    const lessons = await prisma.lesson.findMany({
      where: {
        course: { instructorId: userId },
        contentType: 'video'
      },
      include: {
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    let mediaAssets: any[] = [];
    if (teacher) {
      mediaAssets = await prisma.mediaAsset.findMany({
        where: {
          teacherId: teacher.id,
          fileType: 'video'
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const formattedVideos = [
      ...lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        courseName: lesson.course?.title || 'Unknown Course',
        duration: lesson.duration ? `${Math.floor(lesson.duration / 60)}m ${lesson.duration % 60}s` : '0:00',
        viewCount: 0,
        completionRate: 0,
        status: (lesson.upload_status === 'COMPLETED' ? 'published' : 'processing') as 'published' | 'processing' | 'draft',
        youtubeUrl: lesson.videoUrl,
        createdAt: lesson.createdAt.toISOString()
      })),
      ...mediaAssets.map(asset => ({
        id: asset.id,
        title: asset.title,
        courseName: 'Standalone Vault',
        duration: asset.durationSeconds ? `${Math.floor(asset.durationSeconds / 60)}m ${asset.durationSeconds % 60}s` : '0:00',
        viewCount: asset.usageCount || 0,
        completionRate: 0,
        status: 'published' as 'published' | 'processing' | 'draft',
        youtubeUrl: asset.fileId,
        createdAt: asset.createdAt.toISOString(),
        storage: asset.storageProvider
      }))
    ];

    return ApiResponse.success({ videos: formattedVideos });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST /api/teacher/videos
 * Create a new video entry in the vault (linked to a course or as a standalone asset).
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateTeacher(req);

    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId }
    });

    if (!teacher) return ApiResponse.error('Teacher profile not found', 'NOT_FOUND', 404);

    const body = await req.json();
    const { title, courseId, url, type = 'link' } = body;

    if (!title || !url) {
      return ApiResponse.error('Title and Source URL are required', 'VALIDATION_ERROR', 400);
    }

    // According to the schema, MediaAsset is better for "Vault" items
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        teacherId: teacher.id,
        title,
        fileType: 'video',
        storageProvider: type === 'youtube' ? 'youtube' : 'external',
        fileId: url,
        fileSizeBytes: 0,
        thumbnailUrl: '',
      }
    });

    // Also, if courseId is provided, create a lesson for it
    if (courseId) {
      // Find the last position in the course
      const lastLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { orderNumber: 'desc' }
      });

      await prisma.lesson.create({
        data: {
          title,
          videoUrl: url,
          courseId,
          orderNumber: (lastLesson?.orderNumber || 0) + 1,
          contentType: 'video',
          upload_status: 'COMPLETED'
        }
      });
    }

    return ApiResponse.success(mediaAsset, 'Video asset synthesized and linked successfully.');
  } catch (error: any) {
    return handleApiError(error);
  }
}
