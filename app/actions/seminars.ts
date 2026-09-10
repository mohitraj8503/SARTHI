'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return { id: session.userId, role: session.role };
}

export async function getSeminars() {
  const user = await getCurrentUser();
  if (!user) return { live: null, upcoming: [], replays: [] };

  try {
    const now = new Date();

    // Find live seminars (status LIVE or scheduledAt within last hour)
    const live = await prisma.seminar.findFirst({
      where: {
        OR: [
          { status: 'LIVE' },
          {
            status: 'SCHEDULED',
            scheduledAt: {
              lte: now,
              gte: new Date(now.getTime() - 60 * 60 * 1000) // Started in last hour
            }
          }
        ]
      },
      include: {
        speaker: { include: { user: { select: { name: true, image: true } } } }
      }
    });

    // Find upcoming seminars
    const upcoming = await prisma.seminar.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gt: now }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: {
        speaker: { include: { user: { select: { name: true, image: true } } } }
      }
    });

    // Find replays (ENDED with video links)
    const replays = await prisma.seminar.findMany({
      where: {
        status: 'ENDED',
        recordingVideoId: { not: null }
      },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
      include: {
        speaker: { include: { user: { select: { name: true, image: true } } } }
      }
    });

    // Map to a consistent format for the UI
    const mapSeminar = (s: any) => {
      const videoId = s.status === 'LIVE' ? s.youtubeBroadcastId : s.recordingVideoId;
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        thumbnailUrl: s.thumbnail || '/images/placeholders/live-session.jpg',
        scheduledStartTime: s.scheduledAt?.toISOString() || now.toISOString(),
        status: s.status,
        instructor: s.speaker?.user || { name: 'TBA', image: null },
        youtubeVideoId: videoId, // Keep prop name same for UI compatibility
        joinUrl: videoId ? `https://youtube.com/watch?v=${videoId}` : '#'
      };
    };

    return {
      live: live ? mapSeminar(live) : null,
      upcoming: upcoming.map(mapSeminar),
      replays: replays.map(mapSeminar)
    };
  } catch (error) {
    console.error('Failed to fetch seminars:', error);
    return { live: null, upcoming: [], replays: [] };
  }
}

