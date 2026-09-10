import { prisma } from '@/lib/prisma';
import { 
  TeacherDashboardData, 
  TeacherTopCourse, 
  TeacherActivityItem, 
  UpcomingEvent, 
  CourseHealthRecord 
} from '@/lib/types/teacher-dashboard';

export class TeacherDashboardService {
  private static cache = new Map<string, { data: TeacherDashboardData; timestamp: number }>();
  private static CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private static MAX_CACHE_SIZE = 100;

  /**
   * Get professional-grade dashboard data for a teacher
   */
  static async getTeacherDashboardData(teacherId: string, period: string = '30d'): Promise<TeacherDashboardData> {
    const startTime = Date.now();
    
    const periodMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    const days = periodMap[period] || 30;
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Find the teacher record for the user to get their teacher ID
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      select: { id: true }
    });

    // 1. Identify Courses owned by this teacher
    const teacherCourses = await prisma.course.findMany({
      where: {
        OR: [
          { instructorId: teacherId },
          ...(teacherProfile ? [{ teacherId: teacherProfile.id }] : [])
        ]
      },
      select: { id: true, title: true, thumbnail: true, price: true }
    });
    const courseIds = teacherCourses.map(c => c.id);

    // 2. Parallel Data Fetching (Ultra-High Density Aggregations)
    const [
      totalStudents,
      activeLearnersCount,
      totalRevenueData,
      lastMonthRevenueData,
      thisMonthRevenueData,
      enrollments,
      recentTransactions,
      seminarStats,
      upcomingSeminars,
      courseReviews,
      assignmentSubmissionsCount,
      studentActivityLogs
    ] = await Promise.all([
      // Total Unique Students
      prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
      
      // Active Learners (Last 30 days)
      prisma.enrollment.count({ 
        where: { courseId: { in: courseIds }, lastAccessedAt: { gte: currentPeriodStart } } 
      }),
      
      // Total Revenue (Only from approved teachers)
      prisma.transaction.aggregate({
        where: { 
          courseId: { in: courseIds }, 
          status: { in: ['succeeded', 'SUCCESS'] },
          course: { teacher: { status: 'approved' } }
        },
        _sum: { amount: true }
      }),

      // Last Month Revenue (Only from approved teachers)
      prisma.transaction.aggregate({
        where: { 
          courseId: { in: courseIds }, 
          status: { in: ['succeeded', 'SUCCESS'] }, 
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
          course: { teacher: { status: 'approved' } }
        },
        _sum: { amount: true }
      }),

      // This Month Revenue (Only from approved teachers)
      prisma.transaction.aggregate({
        where: { 
          courseId: { in: courseIds }, 
          status: { in: ['succeeded', 'SUCCESS'] }, 
          createdAt: { gte: thisMonthStart },
          course: { teacher: { status: 'approved' } }
        },
        _sum: { amount: true }
      }),

      // Enrollments for progress & health
      prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true, courseId: true, progressPercentage: true, userId: true, status: true, lastAccessedAt: true, createdAt: true, user: { select: { name: true, image: true } }, course: { select: { title: true } } }
      }),

      // Recent Transactions for chart
      prisma.transaction.findMany({
        where: { courseId: { in: courseIds }, status: { in: ['succeeded', 'SUCCESS'] }, createdAt: { gte: currentPeriodStart } },
        orderBy: { createdAt: 'asc' },
        select: { amount: true, createdAt: true }
      }),

      // Seminar Requests
      prisma.seminarRequest.groupBy({
        by: ['status'],
        where: { teacherId: teacherId },
        _count: { id: true }
      }),

      // Upcoming Seminars
      prisma.seminarRequest.findMany({
        where: { teacherId: teacherId, status: 'APPROVED', proposedAt: { gte: now } },
        orderBy: { proposedAt: 'asc' },
        take: 5
      }),

      // Course Reviews
      prisma.courseReview.findMany({
        where: { courseId: { in: courseIds } },
        select: { rating: true, courseId: true }
      }),

      // Pending Assignments (Mock/Sample query if applicable)
      prisma.assignmentSubmission.count({
        where: { assignment: { course: { instructorId: teacherId } }, status: 'PENDING' }
      }),

      // Recent Activity Feed
      prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, image: true } }, course: { select: { title: true } } }
      })
    ]);

    // 3. Transformation Logic
    const totalRevenue = Number(totalRevenueData._sum.amount || 0);
    const thisMonthRevenue = Number(thisMonthRevenueData._sum.amount || 0);
    const lastMonthRevenue = Number(lastMonthRevenueData._sum.amount || 0);
    
    // Revenue History (Grouped by date)
    const revenueMap = new Map<string, number>();
    recentTransactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      revenueMap.set(date, (revenueMap.get(date) || 0) + Number(t.amount));
    });
    const history = Array.from(revenueMap.entries()).map(([date, amount]) => ({ date, amount }));

    // Course Health & Top Courses
    const courseStats = teacherCourses.map(course => {
      const relevantEnrollments = enrollments.filter(e => e.courseId === course.id);
      const relevantReviews = courseReviews.filter(r => r.courseId === course.id);
      const revenue = Number(relevantEnrollments.length * Number(course.price));
      const completionRate = relevantEnrollments.length > 0 
        ? Math.round((relevantEnrollments.filter(e => e.progressPercentage === 100).length / relevantEnrollments.length) * 100)
        : 0;
      const avgRating = relevantReviews.length > 0
        ? relevantReviews.reduce((acc, r) => acc + r.rating, 0) / relevantReviews.length
        : 4.5; // Default rating if none

      return {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        enrollments: relevantEnrollments.length,
        revenue,
        rating: avgRating,
        completionRate,
        status: avgRating > 4 ? 'OPTIMAL' : avgRating > 3 ? 'NEEDS_UPDATE' : 'CRITICAL'
      } as const;
    });

    const topCourses: TeacherTopCourse[] = [...courseStats]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail,
        enrollments: c.enrollments,
        revenue: c.revenue,
        rating: c.rating,
        completionRate: c.completionRate
      }));

    const courseHealth: CourseHealthRecord[] = courseStats.map(c => ({
      id: c.id,
      title: c.title,
      rating: c.rating,
      completionRate: c.completionRate,
      revenue: c.revenue,
      status: c.status as 'OPTIMAL' | 'NEEDS_UPDATE' | 'CRITICAL'
    }));

    // Pulse & Insights
    const avgProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) / enrollments.length)
      : 0;
    
    const engagementPercentage = totalStudents > 0 ? Math.round((activeLearnersCount / totalStudents) * 100) : 0;
    
    const activeStudents = enrollments.filter(e => e.lastAccessedAt && (now.getTime() - e.lastAccessedAt.getTime()) < 7 * 24 * 60 * 60 * 1000).length;
    const inactiveStudents = totalStudents - activeStudents;
    const newStudents = enrollments.filter(e => (now.getTime() - e.createdAt.getTime()) < 30 * 24 * 60 * 60 * 1000).length;

    // Mapping Activity Feed
    const recentActivity: TeacherActivityItem[] = studentActivityLogs.map(log => ({
      id: log.id,
      studentId: log.userId,
      studentName: log.user.name || 'Student',
      studentImage: log.user.image,
      courseName: log.course.title,
      type: 'ENROLLMENT',
      progress: log.progressPercentage,
      date: log.createdAt.toISOString()
    }));

    // Upcoming Events
    const upcomingEvents: UpcomingEvent[] = upcomingSeminars.map(s => ({
      id: s.id,
      title: s.title,
      type: 'SEMINAR',
      date: s.proposedAt.toISOString().split('T')[0],
      time: s.proposedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    // Teacher Info
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { name: true, email: true, image: true }
    });

    const statsTyped = seminarStats as unknown as { status: string; _count: { id: number } }[];

    return {
      teacher: {
        name: teacher?.name || 'Educator',
        email: teacher?.email || '',
        image: teacher?.image || null,
      },
      pulse: {
        activeLearners: activeLearnersCount,
        engagementPercentage,
        growthPercentage: 0, // Calculate trend if needed
        avgProgress,
        completionRate: 0, // Aggregated completion
      },
      summary: {
        totalStudents,
        activeCourses: teacherCourses.length,
        totalRevenue,
        lessonsDelivered: 0, // Need to count lessons in courses
        pendingAssignments: assignmentSubmissionsCount,
        unresolvedQuestions: 0, // Need question model check
      },
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        expectedNextMonth: Math.round(thisMonthRevenue * 1.1),
        breakdown: {
          courseSales: thisMonthRevenue,
          seminars: 0,
          subscriptions: 0
        },
        trend: lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
        history
      },
      insights: {
        studentTrendPct: 0,
        courseTrendPct: 0,
        revenueTrendPct: 0,
        lessonsTrendPct: 0,
        revenueGoal: 50000,
        studentActivity: {
          active: activeStudents,
          inactive: inactiveStudents,
          new: newStudents
        }
      },
      topCourses,
      recentActivity,
      upcomingEvents,
      courseHealth,
      seminarRequests: {
        approved: statsTyped.find(s => s.status === 'APPROVED')?._count?.id || 0,
        pending: statsTyped.find(s => s.status === 'PENDING')?._count?.id || 0,
      }
    };
  }

  static async getCachedTeacherDashboardData(teacherId: string, period: string = '30d'): Promise<TeacherDashboardData> {
    const cacheKey = `prof-teacher-dashboard-${teacherId}-${period}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }

    const freshData = await this.getTeacherDashboardData(teacherId, period);
    
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, { data: freshData, timestamp: Date.now() });
    return freshData;
  }
}
