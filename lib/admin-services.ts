import { prisma } from '@/lib/prisma';

// Activity Service for logging and tracking
export const ActivityService = {
  // Log activity to database
  async logActivity(type: string, data: any) {
    try {
      await prisma.platformActivity.create({
        data: {
          type,
          userId: data.userId || null,
          data: JSON.stringify(data),
        },
      });
    } catch (e) {
      console.error('Failed to log activity', e);
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 50) {
    const activities = await prisma.platformActivity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return activities.map((a) => {
      const data = JSON.parse(a.data);
      return {
        id: a.id,
        type: a.type,
        description: this.generateDescription(a.type, data),
        timestamp: a.createdAt,
        userName: data.studentName || data.teacherName || data.userName || 'Unknown',
        ...data,
      };
    });
  },

  generateDescription(type: string, data: any) {
    switch (type) {
      case 'enrollment':
        return `${data.studentName} enrolled in "${data.courseName}"`;
      case 'payment':
        return `Payment of ₹${data.amount} received from ${data.studentName}`;
      case 'course_published':
        return `${data.teacherName} published "${data.courseName}"`;
      case 'video_started':
        return `${data.studentName} started watching "${data.lessonTitle}"`;
      case 'assignment_submitted':
        return `${data.studentName} submitted assignment in "${data.courseName}"`;
      case 'review_added':
        return `${data.studentName} left a ${data.rating}-star review`;
      default:
        return `Activity: ${type}`;
    }
  },
};

// Metrics Service for Dashboard
export const MetricsService = {
  async calculateMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Revenue Today (using Transaction model)
    const revenueAggregation = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: today,
        },
        status: 'succeeded', // Assuming 'succeeded' or 'completed' status
      },
    });
    const revenueToday = revenueAggregation._sum.amount || 0;

    // 2. Enrollments Today
    const enrollmentsToday = await prisma.enrollment.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // 3. Videos Playing (using VideoSession)
    // Since we lack a cron job to expire old heartbeats in SQLite easily,
    // we'll fetch active ones and filter in JS or assume the client updates 'isActive'
    const activeTimeThreshold = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const videosPlaying = await prisma.videoSession.count({
      where: {
        isActive: true,
        lastHeartbeat: {
          gte: activeTimeThreshold,
        },
      },
    });

    // 4. Active Courses (Aggregation)
    // Prisma groupBy is good here
    const activeSessions = await prisma.videoSession.findMany({
      where: {
        isActive: true,
        lastHeartbeat: { gte: activeTimeThreshold },
      },
    });

    // Group by courseId manually or use another query.
    // Let's use a simpler approach: Get all courses, then map. Efficient for small course count.
    // For production "Real Data", let's be precise.
    const courseCounts: Record<string, number> = {};
    activeSessions.forEach((s) => {
      courseCounts[s.courseId] = (courseCounts[s.courseId] || 0) + 1;
    });

    const topCourseIds = Object.keys(courseCounts)
      .sort((a, b) => courseCounts[b] - courseCounts[a])
      .slice(0, 5);
    let activeCourses: {
      id: string;
      title: string;
      thumbnail: string | null;
      active_students: number;
      videos_playing: number;
    }[] = [];

    if (topCourseIds.length > 0) {
      const courses = await prisma.course.findMany({
        where: { id: { in: topCourseIds } },
        select: { id: true, title: true, thumbnail: true },
      });
      activeCourses = courses
        .map((c) => ({
          id: c.id,
          title: c.title,
          thumbnail: c.thumbnail,
          active_students: courseCounts[c.id],
          videos_playing: courseCounts[c.id], // Simplified
        }))
        .sort((a, b) => b.active_students - a.active_students);
    }

    // 5. Geographic Data (Aggregated from UserSession)
    const userSessions = await prisma.userSession.findMany({
      where: { lastActivity: { gte: new Date(Date.now() - 5 * 60 * 1000) } }, // 5 mins
      select: { state: true, city: true },
    });

    const stateMap: Record<string, { name: string; activeUsers: number }> = {};
    userSessions.forEach((s) => {
      const state = s.state || 'Unknown';
      if (!stateMap[state]) stateMap[state] = { name: state, activeUsers: 0 };
      stateMap[state].activeUsers++;
    });

    const byState = Object.values(stateMap).sort((a, b) => b.activeUsers - a.activeUsers);

    return {
      revenueToday,
      enrollmentsToday,
      videosPlaying,
      activeCourses,
      geography: {
        byState,
        topState: byState[0] || { name: 'N/A', activeUsers: 0 },
        activeStatesCount: byState.length,
      },
      performance: await this.getPerformanceMetrics(),
    };
  },

  async getPerformanceMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Fetch logs for the last hour
    const logs = await prisma.apiLog.findMany({
      where: {
        createdAt: { gte: oneHourAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (logs.length === 0) {
      return {
        chart: [],
        current: {
          responseTime: 0,
          requestsPerMin: 0,
          errorRate: 0,
        },
      };
    }

    const totalRequests = logs.length;
    const totalDuration = logs.reduce((acc, log) => acc + log.responseTime, 0);
    const errorCount = logs.filter((log) => log.statusCode >= 400).length;

    // Group by 5-minute intervals for the chart
    const chartData: Array<{
      time: string;
      avgResponseTime: number;
      requestCount: number;
    }> = [];
    let currentIntervalStart = new Date(oneHourAgo);

    for (let i = 0; i < 12; i++) {
      const nextInterval = new Date(currentIntervalStart.getTime() + 5 * 60 * 1000);
      const intervalLogs = logs.filter(
        (l) => l.createdAt >= currentIntervalStart && l.createdAt < nextInterval
      );

      const avgTime =
        intervalLogs.length > 0
          ? Math.round(intervalLogs.reduce((a, b) => a + b.responseTime, 0) / intervalLogs.length)
          : 0;

      chartData.push({
        time: `${currentIntervalStart.getHours()}:${currentIntervalStart
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
        avgResponseTime: avgTime,
        requestCount: intervalLogs.length,
      });
      currentIntervalStart = nextInterval;
    }

    return {
      chart: chartData,
      current: {
        responseTime: Math.round(totalDuration / totalRequests),
        requestsPerMin: Math.round(totalRequests / 60), // Avg per minute over the hour
        errorRate: Number((errorCount / totalRequests).toFixed(2)),
      },
    };
  },
};
