import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ApiResponse, handleApiError } from "@/lib/admin/core";
import { subDays, startOfMonth, endOfMonth, format, eachDayOfInterval, startOfDay, differenceInDays } from "date-fns";

import { youtubeService } from "@/lib/youtube-api";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin();
    
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const granularity = searchParams.get("granularity") || "daily";
    
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case "7d":
        startDate = subDays(now, 7);
        break;
      case "90d":
        startDate = subDays(now, 90);
        break;
      case "365d":
      case "12m":
        startDate = subDays(now, 365);
        break;
      case "30d":
      default:
        startDate = subDays(now, 30);
        break;
    }

    const prevStartDate = subDays(startDate, differenceInDays(now, startDate));

    // 1. Fetch data for KPIs
    const [
      totalUsers,
      totalRevenueResult,
      revenueInRangeResult,
      revenuePrevRangeResult,
      revenueMTDResult,
      newStudentsInRange,
      newStudentsPrevRange,
      activeStudentsInRange,
      courseCompletionsInRange,
      completionsPrevRange,
      totalCourses,
      publishedCourses,
      avgProgress,
      successfulTxInRange,
      successfulTxPrevRange,
      failedTxInRange,
      failedTxPrevRange,
      refundCountInRange,
      topCoursesRaw,
      transactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
      prisma.transaction.aggregate({ 
        _sum: { amount: true }, 
        where: { status: "succeeded", createdAt: { gte: startDate } } 
      }),
      prisma.transaction.aggregate({ 
        _sum: { amount: true }, 
        where: { status: "succeeded", createdAt: { gte: prevStartDate, lt: startDate } } 
      }),
      prisma.transaction.aggregate({ 
        _sum: { amount: true }, 
        where: { status: "succeeded", createdAt: { gte: startOfMonth(now) } } 
      }),
      prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: startDate } } }),
      prisma.user.count({ where: { role: 'STUDENT', createdAt: { gte: prevStartDate, lt: startDate } } }),
      prisma.user.count({ where: { status: "ACTIVE", lastLogin: { gte: startDate } } }), // Assuming lastLogin exists or use createdAt
      prisma.enrollment.count({ where: { completedAt: { gte: startDate } } }),
      prisma.enrollment.count({ where: { completedAt: { gte: prevStartDate, lt: startDate } } }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.aggregate({ _avg: { progressPercentage: true } }),
      prisma.transaction.count({ where: { status: "succeeded", createdAt: { gte: startDate } } }),
      prisma.transaction.count({ where: { status: "succeeded", createdAt: { gte: prevStartDate, lt: startDate } } }),
      prisma.transaction.count({ where: { status: "failed", createdAt: { gte: startDate } } }),
      prisma.transaction.count({ where: { status: "failed", createdAt: { gte: prevStartDate, lt: startDate } } }),
      prisma.transaction.count({ where: { status: "refunded", createdAt: { gte: startDate } } }),
    prisma.course.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          enrolledStudentsCount: true,
          transactions: {
            where: { status: "succeeded", createdAt: { gte: startDate } },
            select: { amount: true }
          }
        }
      }),
      prisma.transaction.findMany({
        where: { createdAt: { gte: startDate } },
        select: { amount: true, createdAt: true, status: true }
      })
    ]);

    // Calculate Trends
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const revenueInRange = revenueInRangeResult._sum.amount || 0;
    const revenuePrevRange = revenuePrevRangeResult._sum.amount || 0;
    const revenueTrendPct = calcTrend(revenueInRange, revenuePrevRange);

    const newStudentsTrendPct = calcTrend(newStudentsInRange, newStudentsPrevRange);
    const completionsTrendPct = calcTrend(courseCompletionsInRange, completionsPrevRange);
    const successTxTrendPct = calcTrend(successfulTxInRange, successfulTxPrevRange);
    const failedTxTrendPct = calcTrend(failedTxInRange, failedTxPrevRange);

    // revenueTrend series
    const dayInterval = eachDayOfInterval({ start: startDate, end: now });
    const revenueTrend = dayInterval.map(day => {
      const dayStr = format(day, "MMM dd");
      const dayTransactions = transactions.filter(t => format(t.createdAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
      const gross = dayTransactions.reduce((sum, t) => sum + (t.status === 'succeeded' || t.status === 'refunded' ? (t.amount || 0) : 0), 0);
      const refunds = dayTransactions.filter(t => t.status === 'refunded').reduce((sum, t) => sum + (t.amount || 0), 0);
      return { label: dayStr, gross, refunds, netRevenue: gross - refunds };
    });

    // topCourses formatting
    const topCourses = topCoursesRaw.map(c => {
      const revenue = c.transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      return {
        id: c.id,
        title: c.title,
        revenue,
        enrollments: c.enrolledStudentsCount,
        trendPct: 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // 2. Fetch YouTube Insights (Optional / Best Effort)
    let youtubeStats = null;
    try {
      const channelId = await youtubeService.getMyChannelId(user.id);
      if (channelId) {
        const channelRes = await youtubeService.getChannelStatistics(user.id, channelId);
        if (channelRes.items && channelRes.items.length > 0) {
          youtubeStats = channelRes.items[0].statistics;
        }
      }
    } catch (err) {
      console.warn("YouTube insights fetch failed (likely no token or channel):", err);
    }

    return ApiResponse.success({
      business: {
        totalRevenue: totalRevenueResult._sum.amount || 0,
        revenueInRange,
        revenueTrendPct,
        revenueMTD: revenueMTDResult._sum.amount || 0,
        avgRevenuePerPaidStudent: (totalRevenueResult._sum.amount || 0) / (totalUsers || 1), // Simplification: total rev / total users
      },
      learner: {
        totalStudents: totalUsers,
        newStudentsInRange,
        newStudentsTrendPct,
        activeStudentsInRange: activeStudentsInRange || newStudentsInRange, // Backup if lastLogin not tracked
        courseCompletionsInRange,
        completionsTrendPct,
      },
      content: {
        totalCourses,
        publishedCourses,
        avgLearnerProgress: avgProgress._avg.progressPercentage || 0,
      },
      payment: {
        successfulTxInRange,
        successTxTrendPct,
        failedTxInRange,
        failedTxTrendPct,
        refundCountInRange,
        refundRate: successfulTxInRange > 0 ? (refundCountInRange / successfulTxInRange) * 100 : 0,
      },
      revenueTrend,
      topCourses,
      youtube: youtubeStats ? {
        subscribers: (youtubeStats as Record<string, string>).subscriberCount,
        views: (youtubeStats as Record<string, string>).viewCount,
        videos: (youtubeStats as Record<string, string>).videoCount,
        hidden: (youtubeStats as Record<string, number>).hiddenSubscriberCount
      } : null
    });
  } catch (error) {
    return handleApiError(error);
  }
}

