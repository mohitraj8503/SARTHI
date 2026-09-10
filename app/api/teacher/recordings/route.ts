import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { authenticateTeacher } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/recordings
 * Fetch all live class recordings (YouTube based) for the teacher's vault.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const recordings = await prisma.liveClassRecording.findMany({
      where: {
        liveClass: { teacherId: userId }
      },
      include: {
        liveClass: { select: { title: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedRecordings = recordings.map((r: any) => ({
      id: r.id,
      title: r.liveClass?.title || `Live Class Recording ${r.createdAt.toLocaleDateString()}`,
      courseName: r.course?.title || 'Live Class',
      duration: r.durationSeconds ? `${Math.floor(r.durationSeconds / 60)}m ${r.durationSeconds % 60}s` : 'Processing...',
      viewCount: 0,
      completionRate: 0,
      status: r.processedAt ? 'published' : 'processing',
      youtubeUrl: `https://www.youtube.com/watch?v=${r.youtubeVideoId}`,
      createdAt: r.createdAt.toISOString(),
      storage: 'youtube'
    }));

    return ApiResponse.success({ 
      recordings: formattedRecordings,
      stats: {
        totalVideos: recordings.length,
        totalWatchTime: `${Math.round(recordings.reduce((acc: number, r: any) => acc + (r.durationSeconds || 0), 0) / 3600)}h`,
        avgCompletion: '100%'
      }
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
