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

    const performance = await cacheData(
      `dashboard:performance:${userId}`,
      async () => {
        const myCourses = await prisma.course.findMany({
          where: { instructorId: userId },
          select: { 
            id: true,
            duration: true,
            lessons: {
              where: { isPublished: true },
              select: { duration: true }
            },
            enrollments: {
              where: { status: 'active' },
              select: { id: true }
            }
          }
        });
        const myCourseIds = myCourses.map(c => c.id);
        const enrollmentIds = myCourses.flatMap(c => c.enrollments.map(e => e.id));

        if (myCourseIds.length === 0) {
          return {
            pulse: { activeLearners: 0, aiAnalysis: false, engagementPercentage: 0, growthPercentage: 0 },
            weather: { condition: 'Rainy', engagement: 0, growth: 0, care: 100 }
          };
        }

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const [
          activeLearnersCount,
          totalWatchedResult,
          thisWeekProgress,
          lastWeekProgress,
          totalQuestions,
          answeredQuestions
        ] = await Promise.all([
          // Active Learners
          prisma.videoSession.count({
            where: { courseId: { in: myCourseIds }, lastHeartbeat: { gte: tenMinutesAgo } }
          }),
          // Total Watched Time
          prisma.progress.aggregate({
            where: { enrollmentId: { in: enrollmentIds } },
            _sum: { watchedTime: true }
          }),
          // Growth Proxies
          prisma.progress.count({
            where: { enrollmentId: { in: enrollmentIds }, updatedAt: { gte: oneWeekAgo } }
          }),
          prisma.progress.count({
            where: { enrollmentId: { in: enrollmentIds }, updatedAt: { gte: twoWeeksAgo, lt: oneWeekAgo } }
          }),
          // Care Metrics
          prisma.question.count({
            where: { courseId: { in: myCourseIds } }
          }),
          prisma.question.count({
            where: { courseId: { in: myCourseIds }, answers: { some: {} } }
          })
        ]);

        const totalSecondsWatched = totalWatchedResult._sum.watchedTime || 0;
        const totalMinutesWatched = totalSecondsWatched / 60;

        const totalPossibleMinutes = myCourses.reduce((acc, course) => {
          const courseDuration = course.lessons.reduce((lSum, l) => lSum + (l.duration || 0), 0) || (course.duration || 0) || 1;
          return acc + (courseDuration * course.enrollments.length);
        }, 0);

        const engagementPercentage = totalPossibleMinutes > 0 
          ? Math.min((totalMinutesWatched / totalPossibleMinutes) * 100, 100) 
          : 0;

        let growthPercentage = 0;
        if (lastWeekProgress > 0) {
          growthPercentage = ((thisWeekProgress - lastWeekProgress) / lastWeekProgress) * 100;
        } else if (thisWeekProgress > 0) {
          growthPercentage = 100;
        }

        const carePercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 100;

        let weatherCondition = 'Rainy';
        if (engagementPercentage >= 80 && growthPercentage >= 10) {
          weatherCondition = 'Sunny';
        } else if (engagementPercentage >= 60) {
          weatherCondition = 'Cloudy';
        }

        return {
          pulse: {
            activeLearners: activeLearnersCount,
            aiAnalysis: activeLearnersCount > 0,
            engagementPercentage: Math.round(engagementPercentage),
            growthPercentage: Math.round(growthPercentage),
          },
          weather: {
            condition: weatherCondition,
            engagement: Math.round(engagementPercentage),
            growth: Math.round(growthPercentage),
            care: Math.round(carePercentage),
          }
        };
      },
      60
    );

    return NextResponse.json(performance, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Performance] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

