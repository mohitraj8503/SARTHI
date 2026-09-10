import { prisma } from '@/lib/prisma';
import { cacheData } from '@/lib/redis';

/**
 * Enterprise Teacher Course Data Utility
 * Implements Redis caching and parallelized database aggregation.
 */
export async function getTeacherCourses(userId: string) {
  // Cache for 3 minutes (180s)
  return cacheData(`teacher:courses:list:${userId}`, async () => {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: { id: true }
      });

      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { instructorId: userId },
            ...(teacher ? [{ teacherId: teacher.id }] : [])
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          price: true,
          thumbnail: true,
          isPublished: true,
          slug: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      if (courses.length === 0) return { courses: [] };

      const courseIds = courses.map(c => c.id);

      // Batch aggregations to avoid N+1 queries
      const [enrollmentCounts, revenueCounts, lessonCounts] = await Promise.all([
        prisma.enrollment.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds }, status: 'active' },
          _count: true
        }),
        prisma.transaction.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds }, status: { in: ['succeeded', 'SUCCESS'] } },
          _sum: { amount: true }
        }),
        prisma.lesson.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds } },
          _count: true
        })
      ]);

      const enrollmentMap = new Map(enrollmentCounts.map(e => [e.courseId, e._count]));
      const revenueMap = new Map(revenueCounts.map(r => [r.courseId, r._sum.amount || 0]));
      const lessonMap = new Map(lessonCounts.map(l => [l.courseId, l._count]));

      const enrichedCourses = courses.map(course => ({
        ...course,
        price: Number(course.price || 0),
        status: course.isPublished ? 'published' : 'draft',
        studentsEnrolled: enrollmentMap.get(course.id) || 0,
        totalRevenue: Number(revenueMap.get(course.id)) || 0,
        totalVideos: lessonMap.get(course.id) || 0,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      }));

      return { courses: enrichedCourses };
    } catch (error) {
      console.error('[Teacher Course Data Error]:', error);
      throw error;
    }
  }, 180);
}
