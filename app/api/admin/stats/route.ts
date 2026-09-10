export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { DashboardCache } from '@/lib/cache/dashboard-cache';

// Helper to get IST date boundaries
function getISTDateBoundaries() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  
  const todayStart = new Date(istNow);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(istNow);
  todayEnd.setHours(23, 59, 59, 999);
  
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  
  return {
    todayStartUTC: new Date(todayStart.getTime() - istOffset),
    todayEndUTC: new Date(todayEnd.getTime() - istOffset),
    yesterdayStartUTC: new Date(yesterdayStart.getTime() - istOffset),
    tomorrowStartUTC: new Date(tomorrowStart.getTime() - istOffset),
  };
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('tt_session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    });
    
    const role = String(user?.role || '').toUpperCase();
    if (!['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { todayStartUTC, yesterdayStartUTC, tomorrowStartUTC } = getISTDateBoundaries();

    const statsData = await DashboardCache.getOrSet('admin_stats_overview', async () => {
      // Parallel queries for performance
      const [
        totalRevenueResult,
        thisMonthRevenueResult,
        lastMonthRevenueResult,
        activeStudentsResult,
        lastMonthActiveStudentsResult,
        todaysEnrollmentResult,
        yesterdayEnrollmentResult,
        enrollmentsResult,
        completedEnrollmentsResult,
        lastMonthEnrollmentsResult,
        lastMonthCompletedResult,
        recentActivities
      ] = await Promise.all([
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: 'succeeded' }
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            status: 'succeeded',
            createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          }
        }),
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
        prisma.user.count({
          where: { role: 'STUDENT', status: 'ACTIVE' }
        }),
        prisma.user.count({
          where: {
            role: 'STUDENT',
            status: 'ACTIVE',
            createdAt: { lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          }
        }),
        prisma.enrollment.count({
          where: {
            status: 'active',
            createdAt: { gte: todayStartUTC, lt: tomorrowStartUTC }
          }
        }),
        prisma.enrollment.count({
          where: {
            status: 'active',
            createdAt: { gte: yesterdayStartUTC, lt: todayStartUTC }
          }
        }),
        prisma.enrollment.count({ where: { status: 'active' } }),
        prisma.enrollment.count({
          where: {
            status: 'active',
            OR: [{ progressPercentage: 100 }, { completedAt: { not: null } }]
          }
        }),
        prisma.enrollment.count({
          where: {
            status: 'active',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.enrollment.count({
          where: {
            status: 'active',
            OR: [{ progressPercentage: 100 }, { completedAt: { not: null } }],
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        prisma.activityLog.findMany({
          take: 10,
          orderBy: { timestamp: 'desc' }
        })
      ]);

      return {
        totalRevenueResult,
        thisMonthRevenueResult,
        lastMonthRevenueResult,
        activeStudentsResult,
        lastMonthActiveStudentsResult,
        todaysEnrollmentResult,
        yesterdayEnrollmentResult,
        enrollmentsResult,
        completedEnrollmentsResult,
        lastMonthEnrollmentsResult,
        lastMonthCompletedResult,
        recentActivities
      };
    });

    const {
      totalRevenueResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult,
      activeStudentsResult,
      lastMonthActiveStudentsResult,
      todaysEnrollmentResult,
      yesterdayEnrollmentResult,
      enrollmentsResult,
      completedEnrollmentsResult,
      lastMonthEnrollmentsResult,
      lastMonthCompletedResult,
      recentActivities
    } = statsData;

    const totalRevenue = totalRevenueResult._sum.amount || 0;
    const activeStudents = activeStudentsResult;
    const todaysEnrollment = todaysEnrollmentResult;
    const totalActiveEnrollments = enrollmentsResult;
    const completedEnrollments = completedEnrollmentsResult;
    
    const completionRatePct = totalActiveEnrollments > 0 
      ? Math.round((completedEnrollments / totalActiveEnrollments) * 100)
      : 0;

    const thisMonthRevenue = thisMonthRevenueResult._sum.amount || 0;
    const lastMonthRevenue = lastMonthRevenueResult._sum.amount || 0;
    const revenueChangePct = calculateChange(thisMonthRevenue, lastMonthRevenue);
    const activeStudentsChangePct = calculateChange(activeStudents, lastMonthActiveStudentsResult);
    const todaysEnrollmentChangePct = calculateChange(todaysEnrollment, yesterdayEnrollmentResult);
    
    const lastMonthEnrollments = lastMonthEnrollmentsResult;
    const lastMonthCompleted = lastMonthCompletedResult;
    const lastMonthCompletionRate = lastMonthEnrollments > 0 
      ? Math.round((lastMonthCompleted / lastMonthEnrollments) * 100)
      : 0;
    const completionRateChangePct = calculateChange(completionRatePct, lastMonthCompletionRate);

    // Format for backward compatibility
    const stats = {
      totalUsers: activeStudents,
      totalCourses: await prisma.course.count(),
      totalEnrollments: totalActiveEnrollments,
      totalRevenue: totalRevenue,
      enrollmentsToday: todaysEnrollment,
      avgCompletionRate: completionRatePct,
      revenueSeries: [0, 0, 0, 0, 0, 0, 0],
      seriesLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      // New fields
      revenueChangePct,
      activeStudentsChangePct,
      todaysEnrollmentChangePct,
      completionRateChangePct,
      recentActivities: recentActivities.map((a: any) => ({
        id: a.id,
        type: a.type,
        description: `${a.actorName} - ${a.type}`,
        userName: a.actorName || 'System',
        timestamp: a.timestamp
      }))
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

