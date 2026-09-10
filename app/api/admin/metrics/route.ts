export const dynamic = "force-dynamic";
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { prisma } from '@/lib/prisma';

// Helper to get IST date boundaries
function getISTDateBoundaries() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const todayStart = new Date(istNow);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  return {
    todayStartUTC: new Date(todayStart.getTime() - istOffset),
    yesterdayStartUTC: new Date(yesterdayStart.getTime() - istOffset),
    tomorrowStartUTC: new Date(tomorrowStart.getTime() - istOffset),
  };
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { todayStartUTC, yesterdayStartUTC, tomorrowStartUTC } = getISTDateBoundaries();

    // Parallel queries for performance
    const [
      // Total Revenue (all time - succeeded transactions)
      totalRevenueResult,

      // Revenue this month
      thisMonthRevenueResult,

      // Revenue last month (for change calculation)
      lastMonthRevenueResult,

      // Active Students (students with ACTIVE status)
      activeStudentsResult,

      // Active Students last month
      lastMonthActiveStudentsResult,

      // Today's Enrollment count
      todaysEnrollmentResult,

      // Yesterday's Enrollment (for change)
      yesterdayEnrollmentResult,

      // All active enrollments for completion rate
      enrollmentsResult,

      // Completed enrollments count
      completedEnrollmentsResult,

      // Last month's enrollments for completion change
      lastMonthEnrollmentsResult,
      lastMonthCompletedResult,
    ] = await Promise.all([
      // Total Revenue
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'succeeded' }
      }),

      // This month revenue
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Last month revenue
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          status: 'succeeded',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Active Students
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE'
        }
      }),

      // Last month active students (same day last month)
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          createdAt: {
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Today's Enrollment
      prisma.enrollment.count({
        where: {
          status: 'active',
          createdAt: {
            gte: todayStartUTC,
            lt: tomorrowStartUTC
          }
        }
      }),

      // Yesterday's Enrollment
      prisma.enrollment.count({
        where: {
          status: 'active',
          createdAt: {
            gte: yesterdayStartUTC,
            lt: todayStartUTC
          }
        }
      }),

      // All active enrollments (for completion rate)
      prisma.enrollment.count({
        where: { status: 'active' }
      }),

      // Completed enrollments (progressPercentage = 100 OR completedAt not null)
      prisma.enrollment.count({
        where: {
          status: 'active',
          OR: [
            { progressPercentage: 100 },
            { completedAt: { not: null } }
          ]
        }
      }),

      // Last month total enrollments
      prisma.enrollment.count({
        where: {
          status: 'active',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Last month completed enrollments
      prisma.enrollment.count({
        where: {
          status: 'active',
          OR: [
            { progressPercentage: 100 },
            { completedAt: { not: null } }
          ],
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
    ]);

    // Calculate values
    const totalRevenue = totalRevenueResult._sum.amount || 0;
    const activeStudents = activeStudentsResult;
    const todaysEnrollment = todaysEnrollmentResult;
    const totalActiveEnrollments = enrollmentsResult;
    const completedEnrollments = completedEnrollmentsResult;

    // Calculate completion rate
    const completionRatePct = totalActiveEnrollments > 0
      ? Math.round((completedEnrollments / totalActiveEnrollments) * 100)
      : 0;

    // Calculate changes
    const thisMonthRevenue = thisMonthRevenueResult._sum.amount || 0;
    const lastMonthRevenue = lastMonthRevenueResult._sum.amount || 0;
    const revenueChangePct = calculateChange(thisMonthRevenue, lastMonthRevenue);

    const activeStudentsChangePct = calculateChange(activeStudents, lastMonthActiveStudentsResult);

    const todaysEnrollmentChangePct = calculateChange(todaysEnrollment, yesterdayEnrollmentResult);

    // Calculate completion rate change
    const lastMonthEnrollments = lastMonthEnrollmentsResult;
    const lastMonthCompleted = lastMonthCompletedResult;
    const lastMonthCompletionRate = lastMonthEnrollments > 0
      ? Math.round((lastMonthCompleted / lastMonthEnrollments) * 100)
      : 0;
    const completionRateChangePct = calculateChange(completionRatePct, lastMonthCompletionRate);

    return ApiResponse.success({
      totalRevenue,
      revenueChangePct,
      activeStudents,
      activeStudentsChangePct,
      todaysEnrollment,
      todaysEnrollmentChangePct,
      completionRatePct,
      completionRateChangePct,
      _metadata: {
        calculatedAt: new Date().toISOString(),
        timezone: 'IST',
        lastMonthRevenue,
        thisMonthRevenue,
        totalActiveEnrollments,
        completedEnrollments
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

