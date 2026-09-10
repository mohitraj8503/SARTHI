import { prisma } from '../prisma';

/**
 * Enterprise Performance Data Access Layer
 * Implements batching and optimized inclusion to eliminate N+1 query patterns.
 */
export class OptimizedQueries {
  
  /**
   * Fetches comprehensive teacher dashboard state in a single optimized pass.
   */
  static async getTeacherDashboardData(teacherId: string) {
    return prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            thumbnail: true,
            _count: { select: { enrollments: true } },
            price: true
          }
        },
        teacher: {
          select: {
            liveSessions: {
              where: { status: { in: ['SCHEDULED', 'LIVE'] } },
              select: { id: true, title: true, scheduledStart: true, status: true },
              orderBy: { scheduledStart: 'asc' },
              take: 5
            }
          }
        }
      }
    });
  }

  /**
   * Student dashboard data with atomic XP aggregation.
   */
  static async getStudentDashboardData(userId: string) {
    return prisma.$transaction(async (tx) => {
      const [enrollments, progress, notifications] = await Promise.all([
        tx.enrollment.findMany({
          where: { userId, status: 'ACTIVE' },
          include: { course: { select: { id: true, title: true, thumbnail: true } } },
          take: 8
        }),
        tx.progress.findMany({
          where: { userId },
          select: { lessonId: true, completed: true, updatedAt: true }
        }),
        tx.notification.findMany({
          where: { userId, isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return { enrollments, progress, notifications };
    });
  }
}
