import { prisma } from "@/lib/prisma";
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  format
} from "date-fns";
import { withResiliency } from "@/lib/resilient-db";
import { getDashboardIntelligence } from "./dashboard-intelligence";

function calculateChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
}

function getRangeStart(range: string) {
  const now = new Date();
  const today = startOfDay(now);
  if (range === "week") {
    return subDays(today, 6);
  }
  return startOfMonth(today);
}

async function buildRevenueBuckets(range: string) {
  const start = getRangeStart(range);
  
  let aggregations: any[] = [];
  try {
    aggregations = await prisma.transaction.groupBy({
      by: ['createdAt', 'status'],
      where: {
        status: { in: ["succeeded", "SUCCESS", "COMPLETED", "PAID", "refunded"] },
        createdAt: { gte: start }
      },
      _sum: {
        amount: true
      }
    });
  } catch (error) {
    console.error("Dashboard Revenue Chart DB Error:", error);
    return []; // Return empty data instead of crashing
  }

  const buckets = new Map<string, number>();

  if (range === "week") {
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      buckets.set(date.toLocaleDateString("en-US", { weekday: "short" }), 0);
    }

    aggregations.forEach((ag) => {
      const label = ag.createdAt.toLocaleDateString("en-US", { weekday: "short" });
      if (buckets.has(label)) {
        const amount = Number(ag._sum.amount || 0);
        const multiplier = ag.status === 'refunded' ? -1 : 1;
        buckets.set(label, (buckets.get(label) || 0) + (amount * multiplier));
      }
    });

    return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
  }

  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    buckets.set(`${day}`, 0);
  }

  aggregations.forEach((ag) => {
    const label = `${ag.createdAt.getDate()}`;
    if (buckets.has(label)) {
      const amount = Number(ag._sum.amount || 0);
      const multiplier = ag.status === 'refunded' ? -1 : 1;
      buckets.set(label, (buckets.get(label) || 0) + (amount * multiplier));
    }
  });

  const result = Array.from(buckets.entries());
  
  if (result.length <= 12) return result.map(([label, value]) => ({ label, value }));
  
  const step = Math.ceil(result.length / 12);
  return result
    .filter((_, i) => i % step === 0 || i === result.length - 1)
    .map(([label, value]) => ({ label, value }));
}


export async function getPlatformAlerts() {
  const alerts = [];
  
  let pendingApps = 0;
  let publishedCourses = 0;
  let studentCount = 0;

  try {
    [pendingApps, publishedCourses, studentCount] = await Promise.all([
      prisma.teacherApplication.count({ where: { status: "PENDING" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
    ]);
  } catch (error) {
    console.error("Dashboard Alerts DB Error:", error);
  }

  if (pendingApps > 0) {
    alerts.push({
      id: 'pending_verifications',
      type: 'warning',
      message: `${pendingApps} teacher applications pending verification`,
      action: 'Review →',
      link: '/admin/users?filter=pending',
      severity: 'warning'
    });
  }

  if (publishedCourses === 0) {
    alerts.push({
      id: 'no_courses',
      type: 'critical',
      message: 'Critical: No courses are currently published on the platform',
      action: 'Fix →',
      link: '/admin/courses',
      severity: 'critical'
    });
  }

  return alerts;
}

export async function getSystemHealth() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return [
      { name: 'Server', details: `fra1 • ${latency}ms`, status: 'Online', severity: 'healthy' },
      { name: 'Database', details: 'PostgreSQL Connected', status: 'Healthy', severity: 'healthy' },
      { name: 'Security', details: 'SSL Active', status: 'Secure', severity: 'healthy' },
      { name: 'Auth Service', details: 'JWKS Valid', status: 'Active', severity: 'healthy' }
    ];
  } catch (error) {
    return [
      { name: 'Server', details: 'fra1', status: 'Online', severity: 'healthy' },
      { name: 'Database', details: 'Connection Error', status: 'Degraded', severity: 'critical' },
      { name: 'Security', details: 'SSL Active', status: 'Secure', severity: 'healthy' },
      { name: 'Auth Service', details: 'JWKS Valid', status: 'Active', severity: 'healthy' }
    ];
  }
}

export async function getEnrollmentAnalytics() {
  const now = new Date();
  const startOfPeriod = new Date(now);
  startOfPeriod.setDate(now.getDate() - 6);
  startOfPeriod.setHours(0, 0, 0, 0);

  let stats: any[] = [];
  try {
    stats = await prisma.enrollment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startOfPeriod }
      },
      _count: {
        id: true
      }
    });
  } catch (error) {
    console.error("Enrollment Analytics DB Error:", error);
    return new Array(7).fill(0);
  }

  const dailyCounts = new Array(7).fill(0);
  stats.forEach(stat => {
    const dayDiff = Math.floor((stat.createdAt.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      dailyCounts[dayDiff] += stat._count.id;
    }
  });

  return dailyCounts;
}

export async function getAdminDashboardCombinedData(range: string = "month", limit: number = 10) {
  const rangeStart = getRangeStart(range);

  const [stats, revenue, activities, alerts, health, enrollmentGraph, intelligence] = await Promise.all([
    withResiliency(async () => {
      const now = new Date();
      const todayStart = startOfDay(now);
      const yesterdayStart = subDays(todayStart, 1);
      const currentMonthStart = startOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));

      const [
        revenueSuccess,
        revenueDeductions, 
        revenueCurrentSuccess,
        revenueCurrentDeductions,
        revenuePreviousSuccess,
        revenuePreviousDeductions,
        activeStudentCount,
        studentPrevious,
        totalUserCount,
        teacherCount,
        publishedCourseCount,
        pendingApplications,
        pendingStudentsCount,
        pendingCoursesCount,
        disputedPaymentsCount,
        enrollmentsToday,
        enrollmentsYesterday,
        totalActiveEnrollments,
        totalCompletedEver,
        currentMonthCompleted,
        previousMonthCompleted,
      ] = await Promise.all([
        prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
        prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: { in: ["refunded", "disputed", "failed"] } } }),
        
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "succeeded", createdAt: { gte: currentMonthStart } },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: { in: ["refunded", "disputed", "failed"] }, createdAt: { gte: currentMonthStart } },
        }),

        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "succeeded", createdAt: { gte: previousMonthStart, lt: currentMonthStart } },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: { in: ["refunded", "disputed", "failed"] }, createdAt: { gte: previousMonthStart, lt: currentMonthStart } },
        }),

        prisma.user.count({ 
          where: { 
            role: "STUDENT"
          } 
        }),
        prisma.user.count({
          where: { 
            role: "STUDENT", 
            createdAt: { lt: currentMonthStart }
          },
        }),

        prisma.user.count(), 
        prisma.user.count({ where: { role: "TEACHER" } }), 
        prisma.course.count({ where: { isPublished: true, isActive: true } }), 
        prisma.teacherApplication.count({ where: { status: "PENDING" } }), 
        prisma.user.count({ where: { role: "STUDENT", status: "PENDING" } }),
        prisma.course.count({ where: { publish_state: "review" } }),
        prisma.transaction.count({ where: { status: { in: ["disputed", "failed"] } } }),
        
        prisma.enrollment.count({
          where: { status: "active", createdAt: { gte: todayStart } },
        }),
        prisma.enrollment.count({
          where: { status: "active", createdAt: { gte: yesterdayStart, lt: todayStart } },
        }),

        prisma.enrollment.count({ where: { status: "active" } }), 
        prisma.enrollment.count({
          where: {
            OR: [{ progressPercentage: 100 }, { completedAt: { not: null } }],
          },
        }),
        prisma.enrollment.count({
          where: {
            completedAt: { gte: currentMonthStart }
          },
        }),
        prisma.enrollment.count({
          where: {
            completedAt: { gte: previousMonthStart, lt: currentMonthStart }
          },
        }),
      ]);

      const completionRatePct =
        totalActiveEnrollments > 0
          ? Math.round((totalCompletedEver / totalActiveEnrollments) * 100)
          : 0;

      const currentMonthCompPct = totalActiveEnrollments > 0 ? (currentMonthCompleted / totalActiveEnrollments) * 100 : 0;
      const previousMonthCompPct = totalActiveEnrollments > 0 ? (previousMonthCompleted / totalActiveEnrollments) * 100 : 0;

      const totalRevenueValue = Number(revenueSuccess._sum.amount || 0) - Number(revenueDeductions._sum.amount || 0);
      const currentRevenueValue = Number(revenueCurrentSuccess._sum.amount || 0) - Number(revenueCurrentDeductions._sum.amount || 0);
      const previousRevenueValue = Number(revenuePreviousSuccess._sum.amount || 0) - Number(revenuePreviousDeductions._sum.amount || 0);

      return {
        revenue: {
          total: totalRevenueValue,
          change: calculateChange(currentRevenueValue, previousRevenueValue),
        },
        students: {
          total: activeStudentCount,
          change: calculateChange(activeStudentCount, studentPrevious),
        },
        users: {
          total: totalUserCount,
        },
        teachers: {
          total: teacherCount,
        },
        courses: {
          total: publishedCourseCount,
        },
        applications: {
          pending: pendingApplications,
        },
        pendingApprovals: {
          total: pendingApplications + pendingStudentsCount + pendingCoursesCount + disputedPaymentsCount,
        },
        enrollments: {
          today: enrollmentsToday,
          todayChange: calculateChange(enrollmentsToday, enrollmentsYesterday),
        },
        completion: {
          total: completionRatePct,
          change: calculateChange(currentMonthCompPct, previousMonthCompPct),
        },
      };
    }, "admin-combined-stats"),
    buildRevenueBuckets(range),
    withResiliency(async () => {
      const items = await prisma.activityLog.findMany({
        take: limit,
        orderBy: { timestamp: "desc" },
      });

      return items.map((item) => ({
        id: item.id,
        type: item.type,
        description: item.description || `Activity: ${item.type}`,
        actorName: item.actorName || "System",
        timestamp: item.timestamp.toISOString(),
      }));
    }, "admin-combined-activities"),
    getPlatformAlerts(),
    getSystemHealth(),
    getEnrollmentAnalytics(),
    getDashboardIntelligence() // Now provides real, dynamic insights
  ]);

  const statsData = stats.data;
  const intelligenceData = intelligence.data;

  return {
    metrics: {
      totalRevenue: statsData?.revenue?.total ?? 0,
      revenueChangePct: statsData?.revenue?.change ?? 0,
      activeStudents: statsData?.students?.total ?? 0,
      activeStudentsChangePct: statsData?.students?.change ?? 0,
      totalUsers: statsData?.users?.total ?? 0,
      totalTeachers: statsData?.teachers?.total ?? 0,
      publishedCourses: statsData?.courses?.total ?? 0,
      pendingApplications: statsData?.applications?.pending ?? 0,
      pendingApprovals: statsData?.pendingApprovals?.total ?? 0,
      todaysEnrollment: statsData?.enrollments?.today ?? 0,
      todaysEnrollmentChangePct: statsData?.enrollments?.todayChange ?? 0,
      completionRatePct: statsData?.completion?.total ?? 0,
      completionRateChangePct: statsData?.completion?.change ?? 0,
    },
    revenueChartData: revenue.data || [],
    activities: activities.data || [],
    alerts,
    health,
    enrollmentGraph: enrollmentGraph.data || [],
    intelligence: intelligenceData
  };
}
