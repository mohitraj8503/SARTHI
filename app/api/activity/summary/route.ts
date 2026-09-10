export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withResiliency } from '@/lib/resilient-db';

// GET /api/activity/summary - Get activity summary statistics
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await withResiliency(async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [todayCount, weekCount, criticalCount, warningCount, recentCritical, unreadCount] = await Promise.all([
        prisma.activityLog.count({ where: { timestamp: { gte: todayStart } } }),
        prisma.activityLog.count({ where: { timestamp: { gte: weekStart } } }),
        prisma.activityLog.count({ where: { severity: 'critical', timestamp: { gte: dayAgo } } }),
        prisma.activityLog.count({ where: { severity: 'warning', timestamp: { gte: dayAgo } } }),
        prisma.activityLog.findMany({
          where: { severity: 'critical', isRead: false },
          orderBy: { timestamp: 'desc' },
          take: 10,
        }),
        prisma.activityLog.count({
          where: { isRead: false, severity: { in: ['critical', 'warning'] } },
        }),
      ]);

      let systemHealth = 100 - (criticalCount * 20) - (warningCount * 5);
      systemHealth = Math.max(0, Math.min(100, systemHealth));

      return {
        todayCount,
        weekCount,
        systemHealth,
        criticalEvents: criticalCount,
        warningEvents: warningCount,
        unreadCount,
        recentCritical: recentCritical.map(e => ({
          id: e.id,
          type: e.type,
          action: e.action,
          actorName: e.actorName,
          targetName: e.targetName,
          timestamp: e.timestamp.toISOString(),
        })),
      };
    }, 'Activity Summary');

    if (!data.success || !data.data) {
      return NextResponse.json({
        todayCount: 0,
        weekCount: 0,
        systemHealth: 100,
        criticalEvents: 0,
        warningEvents: 0,
        unreadCount: 0,
        recentCritical: [],
      });
    }

    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error('[Activity Summary API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity summary', details: error.message },
      { status: 500 }
    );
  }
}

