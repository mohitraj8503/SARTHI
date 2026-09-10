// Precomputed metrics for dashboard performance
// This runs as a background job to cache expensive calculations

import { prisma } from './prisma';
import { setDashboardCache } from './redis';

export interface PrecomputedMetrics {
  // Admin metrics
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  pendingPayments: number;
  activeUsers7Days: number;
  activeUsers30Days: number;
  usersBefore30Days: number;
  avgCompletionRate: number;
  avgLatency: number;
  apiCallsLastHour: number;
  revenueSeries: number[];
  seriesLabels: string[];

  // Student metrics (per user)
  enrolledCoursesCount: number;
  totalXP: number;
  totalLessonsCompleted: number;
  weeklyGrowth: number;
  aiCompanionLevel: number;

  // Cached at
  cachedAt: string;
}

/**
 * Precompute admin dashboard metrics
 */
export async function precomputeAdminMetrics(): Promise<PrecomputedMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    pendingPayments,
    activeUsers7Days,
    activeUsers30Days,
    usersBefore30Days,
    avgCompletionRateData,
    revenueData,
    recentTransactions,
    systemStats
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.transaction.count({ where: { status: 'pending_verification' } }),
    prisma.user.count({ where: { lastActive: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { lastActive: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { lt: thirtyDaysAgo } } }),
    prisma.enrollment.aggregate({ _avg: { progressPercentage: true } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'succeeded' }
    }),
    prisma.transaction.findMany({
      where: { status: 'succeeded', createdAt: { gte: sevenDaysAgo } },
      select: { amount: true, createdAt: true }
    }),
    prisma.apiLog.aggregate({
      _avg: { responseTime: true },
      where: { createdAt: { gte: oneHourAgo } },
      _count: true
    })
  ]);

  const totalRevenue = revenueData._sum.amount || 0;
  const avgCompletionRate = avgCompletionRateData._avg.progressPercentage || 0;
  const avgLatency = systemStats._avg.responseTime || 0;
  const apiCallsLastHour = systemStats._count || 0;

  // Process revenue series
  const revenueSeries: number[] = [];
  const seriesLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = date.toLocaleDateString('en-GB');
    seriesLabels.push(dateStr);
    
    const dayRevenue = recentTransactions
      .filter(t => t.createdAt.toDateString() === date.toDateString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    revenueSeries.push(dayRevenue);
  }

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    pendingPayments,
    activeUsers7Days,
    activeUsers30Days,
    usersBefore30Days,
    avgCompletionRate: Math.round(avgCompletionRate),
    avgLatency: Math.round(avgLatency),
    apiCallsLastHour,
    revenueSeries,
    seriesLabels,
    enrolledCoursesCount: 0,
    totalXP: 0,
    totalLessonsCompleted: 0,
    weeklyGrowth: 0,
    aiCompanionLevel: 1,
    cachedAt: new Date().toISOString(),
  };
}

/**
 * Precompute student dashboard metrics for a specific user
 */
export async function precomputeStudentMetrics(userId: string): Promise<Partial<PrecomputedMetrics>> {
  const [
    enrolledCoursesCount,
    totalLessonsCompleted,
    user
  ] = await Promise.all([
    prisma.enrollment.count({
      where: { userId, status: 'active' }
    }),
    prisma.progress.count({
      where: { userId, completed: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true }
    })
  ]);

  return {
    enrolledCoursesCount,
    totalXP: user?.totalPoints || 0,
    totalLessonsCompleted,
    weeklyGrowth: 0,
    aiCompanionLevel: 1,
    cachedAt: new Date().toISOString(),
  };
}


/**
 * Background job to precompute and cache all dashboard metrics
 */
export async function runMetricsPrecomputation() {
  try {
    console.log('[Metrics] Starting precomputation...');

    // Precompute admin metrics
    const adminMetrics = await precomputeAdminMetrics();
    await setDashboardCache('admin_global', adminMetrics, 300); // 5 minutes

    // Precompute metrics for active users (last 7 days)
    const activeUsers = await prisma.user.findMany({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { id: true }
    });

    // Precompute for each active user
    for (const user of activeUsers.slice(0, 100)) { // Limit to 100 users for performance
      try {
        const studentMetrics = await precomputeStudentMetrics(user.id);
        await setDashboardCache(user.id, studentMetrics, 300);
      } catch (error) {
        console.error(`[Metrics] Failed to precompute for user ${user.id}:`, error);
      }
    }

    console.log(`[Metrics] Precomputation completed for ${activeUsers.length} users`);
  } catch (error) {
    console.error('[Metrics] Precomputation failed:', error);
  }
}

/**
 * Get precomputed metrics from cache
 */
export async function getPrecomputedMetrics(userId: string, role: string) {
  const cacheKey = role === 'ADMIN' ? 'admin_global' : userId;
  return await getCachedDashboard(cacheKey);
}

// Import getCachedDashboard
import { getCachedDashboard } from './redis';
