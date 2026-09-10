import { prisma } from '@/lib/prisma';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

export async function calculateGrowthMetrics(teacherId: string, period: 'week' | 'month') {
  const now = new Date();
  let currStart, currEnd, prevStart, prevEnd;

  if (period === 'month') {
    currStart = startOfMonth(subMonths(now, 1));
    currEnd = endOfMonth(subMonths(now, 1));
    prevStart = startOfMonth(subMonths(now, 2));
    prevEnd = endOfMonth(subMonths(now, 2));
  } else {
    currStart = subDays(now, 7);
    currEnd = now;
    prevStart = subDays(now, 14);
    prevEnd = subDays(now, 7);
  }

  // Calculate learners growth
  const [currLearners, prevLearners] = await Promise.all([
    prisma.enrollment.count({
      where: {
        course: { teacherId },
        createdAt: { gte: currStart, lte: currEnd }
      }
    }),
    prisma.enrollment.count({
      where: {
        course: { teacherId },
        createdAt: { gte: prevStart, lte: prevEnd }
      }
    })
  ]);

  const learnersGrowth = calculatePercentageChange(prevLearners, currLearners);

  // Engagement Growth (Watch Time)
  const [currEngagement, prevEngagement] = await Promise.all([
    prisma.progress.aggregate({
      where: {
        lesson: { course: { teacherId } },
        updatedAt: { gte: currStart, lte: currEnd }
      },
      _sum: { watchedTime: true }
    }),
    prisma.progress.aggregate({
      where: {
        lesson: { course: { teacherId } },
        updatedAt: { gte: prevStart, lte: prevEnd }
      },
      _sum: { watchedTime: true }
    })
  ]);

  const engagementGrowth = calculatePercentageChange(
    prevEngagement._sum.watchedTime || 0,
    currEngagement._sum.watchedTime || 0
  );

  // Completion Growth
  const [currCompletion, prevCompletion] = await Promise.all([
    prisma.enrollment.count({
      where: {
        course: { teacherId },
        status: 'completed',
        completedAt: { gte: currStart, lte: currEnd }
      }
    }),
    prisma.enrollment.count({
      where: {
        course: { teacherId },
        status: 'completed',
        completedAt: { gte: prevStart, lte: prevEnd }
      }
    })
  ]);

  const completionGrowth = calculatePercentageChange(prevCompletion, currCompletion);

  return {
    learnersGrowth: clamp(learnersGrowth, -100, 999),
    engagementGrowth: clamp(engagementGrowth, -100, 999),
    completionGrowth: clamp(completionGrowth, -100, 999),
  };
}

function calculatePercentageChange(prev: number, curr: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}
