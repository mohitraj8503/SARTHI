import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths } from 'date-fns';

export async function fetchMetricData(metricId: string) {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));

    switch (metricId) {
      case 'USERS': {
        const total = await prisma.user.count();
        const active = await prisma.user.count({ 
          where: { lastActive: { gte: subMonths(now, 1) } } 
        });
        const engagement = total > 0 ? Math.round((active / total) * 100) : 0;
        return { total, active, engagement: `${engagement}%` };
      }

      case 'COURSES': {
        const total = await prisma.course.count();
        const published = await prisma.course.count({ where: { isPublished: true, isActive: true } });
        return { total, published };
      }

      case 'REVENUE': {
        const agg = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: 'succeeded' }
        });
        const total = agg._sum.amount || 0;
        return { total, message: total > 0 ? "Verified earnings" : "No verified revenue" };
      }

      case 'ENGAGEMENT': {
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = await prisma.user.count({ 
          where: { lastActive: { gte: last7d } } 
        });
        const total = await prisma.user.count();
        const inactiveUsers = total - activeUsers;
        return { activeUsers, inactiveUsers };
      }

      case 'GROWTH': {
        const [currRev, prevRev, currUsers, prevUsers] = await Promise.all([
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: 'succeeded', createdAt: { gte: currentMonthStart } }
          }),
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: 'succeeded', createdAt: { gte: previousMonthStart, lt: currentMonthStart } }
          }),
          prisma.user.count({ where: { createdAt: { gte: currentMonthStart } } }),
          prisma.user.count({ where: { createdAt: { gte: previousMonthStart, lt: currentMonthStart } } })
        ]);

        const cRev = Number(currRev._sum.amount || 0);
        const pRev = Number(prevRev._sum.amount || 0);
        const revGrowth = pRev > 0 ? Math.round(((cRev - pRev) / pRev) * 100) : (cRev > 0 ? 100 : 0);
        const userGrowth = prevUsers > 0 ? Math.round(((currUsers - prevUsers) / prevUsers) * 100) : (currUsers > 0 ? 100 : 0);
        
        return { 
          revenueGrowth: revGrowth, 
          userGrowth: userGrowth, 
          trend: revGrowth >= 0 ? 'bullish' : 'bearish' 
        };
      }

      default:
        return { error: 'Unknown metric' };
    }
  } catch (error) {
    console.error(`Error fetching ${metricId}:`, error);
    return { error: 'Database connection failed' };
  }
}

export async function fetchStudentData(name: string) {
  try {
    const student = await prisma.user.findFirst({
      where: {
        role: 'STUDENT',
        name: { contains: name }
      },
      select: {
        name: true,
        email: true,
        status: true,
        createdAt: true,
        _count: { select: { enrollments: true } }
      }
    });

    if (!student) return { error: 'No record found' };

    return {
      name: student.name,
      email: student.email,
      enrollments: student._count.enrollments,
      status: student.status,
      joined: student.createdAt.toLocaleDateString()
    };
  } catch (error) {
    console.error('Student fetch error:', error);
    return { error: 'Search failed' };
  }
}

export function generateInsight(metricId: string, data: any): string {
  switch (metricId) {
    case 'REVENUE':    return `Revenue: ₹${data.total}\nStatus: ${data.message}`;
    case 'USERS':      return `Active users: ${data.total}\nEngagement: ${data.engagement}`;
    case 'COURSES':    return `Published: ${data.total}\nStatus: Active`;
    case 'GROWTH':     return `Trend: ${data.trend}\nRevenue growth: ${data.revenueGrowth}%`;
    case 'ENGAGEMENT': return `Active: ${data.activeUsers}\nInactive: ${data.inactiveUsers}`;
    default:           return 'Data: Success';
  }
}
