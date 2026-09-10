'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { DashboardRecording } from '@/lib/types/dashboard';

export async function getRecordings(): Promise<DashboardRecording[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    // Get recordings linked to user's enrolled courses.
    // Based on schema, recording is a Seminar with recordingVideoId and status check.
    const recordings = await prisma.seminar.findMany({
      where: {
        OR: [
          { isLive: false },
          { date: { lt: new Date() } }
        ],
        recordingVideoId: { not: null },
        course: {
          enrollments: {
            some: { userId: user.id }
          }
        }
      },
      include: {
        course: { select: { title: true } }
      },
      orderBy: { date: 'desc' },
      take: 20
    });

    return recordings.map(r => ({
      id: r.id,
      title: r.title,
      date: r.date.toISOString(),
      duration: r.durationMinutes || r.duration || 0,
      thumbnail: r.thumbnail || r.thumbnailUrl || `https://img.youtube.com/vi/${r.recordingVideoId}/mqdefault.jpg`,
      videoId: r.recordingVideoId || r.youtubeBroadcastId || '',
      courseName: r.course?.title || 'Workshop'
    }));
  } catch (error) {
    console.error('Failed to fetch recordings:', error);
    return [];
  }
}

