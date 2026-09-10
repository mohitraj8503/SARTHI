import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cacheData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    const topCourses = await cacheData(
      `dashboard:courses:${userId}`,
      async () => {
        const teacher = await prisma.teacher.findUnique({
          where: { userId },
          select: { id: true }
        });

        const courseQueryFilter = {
          OR: [
            { instructorId: userId },
            ...(teacher ? [{ teacherId: teacher.id }] : [])
          ]
        };

        const courses = await prisma.course.findMany({
          where: courseQueryFilter,
          include: {
            lessons: {
              where: { isPublished: true },
              select: { duration: true },
            },
            enrollments: {
              where: { status: 'active' },
              select: { id: true },
            },
            transactions: {
               where: { status: { in: ['succeeded', 'SUCCESS'] } },
               select: { amount: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        });

        if (courses.length === 0) return [];

        const enrollmentIds = courses.flatMap(c => c.enrollments.map(e => e.id));
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [allRecentActivity, allProgressSums] = await Promise.all([
          prisma.progress.groupBy({
            by: ['enrollmentId'],
            where: {
              enrollmentId: { in: enrollmentIds },
              updatedAt: { gte: weekAgo }
            },
            _count: true
          }),
          prisma.progress.groupBy({
            by: ['enrollmentId'],
            where: { enrollmentId: { in: enrollmentIds } },
            _sum: { watchedTime: true }
          })
        ]);

        const recentActivityMap = new Map(allRecentActivity.map(a => [a.enrollmentId, a._count]));
        const progressSumMap = new Map(allProgressSums.map(p => [p.enrollmentId, p._sum.watchedTime || 0]));

        const yourCourses = courses.map((course) => {
          const enrollCount = course.enrollments.length;
          const endpointEnrollments = course.enrollments.map(e => e.id);
          
          let recentActivity = 0;
          let courseTotalSec = 0;
          endpointEnrollments.forEach(eid => {
            recentActivity += recentActivityMap.get(eid) || 0;
            courseTotalSec += progressSumMap.get(eid) || 0;
          });

          const courseDurationSec = (course.lessons.reduce((s, l) => s + (l.duration||0), 0) * 60) || 1;
          const totalPoss = courseDurationSec * (enrollCount || 1);
          const avgWatchPct = totalPoss > 0 ? (courseTotalSec / totalPoss) * 100 : 0;

          const engagementScore = recentActivity + avgWatchPct;
          const revenue = course.transactions.reduce((s, t) => s + t.amount, 0);

          return {
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail,
            enrollments: enrollCount,
            revenue,
            score: engagementScore,
            rating: 4.8
          };
        });

        return yourCourses.sort((a, b) => b.score - a.score);
      },
      120 // 2 minutes cache for course list
    );

    return NextResponse.json(topCourses, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Courses] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

