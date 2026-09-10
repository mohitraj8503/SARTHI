import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { withResiliency } from '@/lib/resilient-db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    
    const statsResult = await withResiliency(async () => {
      // 1. Get Average Rating
      const reviews = await prisma.courseReview.aggregate({
        where: {
          course: {
            instructorId: userId
          }
        },
        _avg: {
          rating: true
        }
      });

      // 2. Get Total Watch Time (from VideoProgress)
      const watchData = await prisma.videoProgress.aggregate({
        where: {
          video: {
            teacher_id: userId
          }
        },
        _sum: {
          watchedTime: true
        }
      });
      
      // 3. Calculate Growth (Comparing current 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [currentRevenue, previousRevenue] = await Promise.all([
        prisma.transaction.aggregate({
          where: { course: { instructorId: userId }, status: 'succeeded', createdAt: { gte: thirtyDaysAgo } },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: { course: { instructorId: userId }, status: 'succeeded', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          _sum: { amount: true }
        })
      ]);

      const revGrowth = previousRevenue._sum.amount ? 
        ((Number(currentRevenue._sum.amount || 0) - Number(previousRevenue._sum.amount)) / Number(previousRevenue._sum.amount)) * 100 : 
        (currentRevenue._sum.amount ? 100 : 0);

      const [currentEnrollments, previousEnrollments] = await Promise.all([
        prisma.enrollment.count({
          where: { course: { instructorId: userId }, createdAt: { gte: thirtyDaysAgo } }
        }),
        prisma.enrollment.count({
          where: { course: { instructorId: userId }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
        })
      ]);

      const enrollGrowth = previousEnrollments > 0 ? 
        ((currentEnrollments - previousEnrollments) / previousEnrollments) * 100 : 
        (currentEnrollments > 0 ? 100 : 0);

      const avgGrowth = Math.round((revGrowth + enrollGrowth) / 2);

      return {
        avgRating: Number((Number(reviews._avg.rating || 0)).toFixed(1)),
        totalWatchTime: Math.round(Number(watchData._sum.watchedTime || 0) / 3600),
        avgGrowth: avgGrowth || 0,
      };
    }, `quick_stats_${userId}`);

    if (statsResult.success && statsResult.data) {
      return NextResponse.json({
        success: true,
        data: statsResult.data,
      });
    }

    return NextResponse.json({
      success: true,
      data: { avgRating: 0, totalWatchTime: 0, avgGrowth: 0 },
      warning: 'Using offline fallback stats'
    });
  } catch (error: any) {
    console.error('Quick Stats API error:', error);
    return NextResponse.json({ 
      success: false, 
      data: { avgRating: 0, totalWatchTime: 0, avgGrowth: 0 } 
    });
  }
}

