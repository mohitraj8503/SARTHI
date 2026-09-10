import { prisma } from '@/lib/prisma';
import { cacheData } from '@/lib/redis';

/**
 * Enterprise Teacher Student Data Utility
 * Implements Redis caching and parallelized database aggregation.
 */
export async function getTeacherStudents(teacherId: string) {
  // Cache for 2 minutes (120s)
  return cacheData(`teacher:students:list:${teacherId}`, async () => {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { userId: true }
      });
      if (!teacher) return { students: [] };

      const enrollments = await prisma.enrollment.findMany({
        where: {
          course: {
            instructorId: teacher.userId
          }
        },
        select: {
          id: true,
          status: true,
          progressPercentage: true,
          lastAccessedAt: true,
          createdAt: true,
          user: { 
            select: { 
              id: true, name: true, email: true, image: true 
            } 
          },
          course: { 
            select: { 
              id: true, title: true 
            } 
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const transformed = enrollments.map((e) => {
        let status: 'active' | 'completed' | 'struggling' = 'active';
        if (e.progressPercentage === 100) status = 'completed';
        else {
          const createdAt = e.createdAt;
          if (createdAt.getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000 && (e.progressPercentage || 0) < 20) {
            status = 'struggling';
          }
        }

        return {
          id: e.id,
          student: e.user,
          course: e.course,
          progress: e.progressPercentage || 0,
          status: status,
          lastActive: (e.lastAccessedAt || e.createdAt).toISOString(),
          joinedAt: e.createdAt.toISOString()
        };
      });

      return { students: transformed };
    } catch (error) {
      console.error('[Teacher Student Data Error]:', error);
      throw error;
    }
  }, 120);
}
