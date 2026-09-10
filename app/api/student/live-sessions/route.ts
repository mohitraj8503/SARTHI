export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { API } from '@/lib/api/response';

export async function GET() {
  try {
    const userSession = await getCurrentUser();
    
    if (!userSession?.id) {
      return API.unauthorized();
    }

    const now = new Date();

    // 1. Get user's enrolled course IDs
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: userSession.id, status: 'active' },
      select: { courseId: true }
    });

    const courseIds = enrollments.map(e => e.courseId);

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    // 2. Fetch live classes for enrolled courses (or global public live classes)
    const activeClasses = await prisma.liveClass.findMany({
      where: {
        AND: [
          {
            OR: [
              { courseId: { in: courseIds } },
              { courseId: '' }, // Global / public live classes
            ]
          },
          {
            OR: [
              { liveKitStatus: 'LIVE' },
              {
                liveKitStatus: 'SCHEDULED',
                scheduledAt: { gte: startToday, lte: endToday }
              }
            ]
          }
        ]
      },
      include: {
        course: { select: { title: true, category: true } },
        teacher: { select: { name: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    const liveSessions = activeClasses.map(lc => {
      const isLive = lc.liveKitStatus === 'LIVE';
      return {
        id: lc.id,
        liveClassId: lc.id,
        title: lc.title,
        courseName: lc.course?.title || 'Live Class',
        instructor: lc.teacher?.name || 'Faculty',
        topic: lc.course?.category || 'Live Class',
        scheduledAt: lc.scheduledAt?.toISOString() || new Date().toISOString(),
        startTime: lc.scheduledAt || new Date(),
        status: isLive ? 'live' : 'upcoming',
        isLiveNow: isLive,
        joinUrl: `/live/${lc.id}`,
        meetingLink: lc.roomName,
      };
    });

    return API.ok({
      sessions: liveSessions,
      count: liveSessions.length
    });

  } catch (error: any) {
    console.error('Live sessions API error:', error);
    return API.server(error.message);
  }
}

