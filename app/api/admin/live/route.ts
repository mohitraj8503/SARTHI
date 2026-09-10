import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, handleApiError } from '@/lib/admin/core';
import { getCurrentUser } from '@/lib/auth';
import { deleteYouTubeVideo } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

// GET /api/admin/live
// List all live classes and basic rollups
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return ApiResponse.error('Forbidden', 'FORBIDDEN', 403);
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'list';

    if (mode === 'analytics') {
      // Basic analytics calculation
      // Calculate totals, average durations, and attendance rates
      const liveClassesCount = await prisma.liveClass.count();
      const endedClasses = await prisma.liveClass.findMany({
        where: { status: 'ENDED' },
        include: {
          attendances: true,
          course: { select: { enrolledStudentsCount: true } }
        }
      });

      let totalAttendance = 0;
      let totalDuration = 0;
      let durationSamples = 0;

      endedClasses.forEach((lc) => {
        totalAttendance += lc.attendances.length;
        lc.attendances.forEach((att) => {
          if (att.joinedAt && att.leftAt) {
            const diff = (att.leftAt.getTime() - att.joinedAt.getTime()) / 1000;
            totalDuration += diff;
            durationSamples++;
          }
        });
      });

      const avgWatchDurationSeconds = durationSamples > 0 ? Math.round(totalDuration / durationSamples) : 0;
      const avgWatchDurationMinutes = Math.round(avgWatchDurationSeconds / 60);

      return ApiResponse.success({
        totalClasses: liveClassesCount,
        avgWatchDurationMinutes,
        totalStudentAttendances: totalAttendance
      });
    }

    // Default mode: list
    const liveClasses = await prisma.liveClass.findMany({
      include: {
        course: { select: { title: true, enrolledStudentsCount: true } },
        teacher: { select: { name: true } },
        recording: true,
        attendances: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return ApiResponse.success({ liveClasses });
  } catch (error: any) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/live?recordingId=XYZ&deleteFromYoutube=true
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return ApiResponse.error('Forbidden', 'FORBIDDEN', 403);
    }

    const { searchParams } = new URL(request.url);
    const recordingId = searchParams.get('recordingId');
    const deleteFromYoutube = searchParams.get('deleteFromYoutube') === 'true';

    if (!recordingId) {
      return ApiResponse.error('recordingId is required', 'VALIDATION_ERROR', 400);
    }

    const recording = await prisma.liveClassRecording.findUnique({
      where: { id: recordingId }
    });

    if (!recording) {
      return ApiResponse.error('Recording not found', 'NOT_FOUND', 404);
    }

    // Optionally delete from YouTube
    if (deleteFromYoutube && recording.youtubeVideoId) {
      try {
        await deleteYouTubeVideo(recording.youtubeVideoId);
      } catch (err) {
        console.error('Failed to delete video from YouTube:', err);
        // Continue database deletion even if YouTube API fails (e.g. video already deleted or token issues)
      }
    }

    await prisma.liveClassRecording.delete({
      where: { id: recordingId }
    });

    return ApiResponse.success(null, 'Recording deleted successfully.');
  } catch (error: any) {
    return handleApiError(error);
  }
}
