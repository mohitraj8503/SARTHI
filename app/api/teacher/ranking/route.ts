import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { cacheData } from '@/lib/redis';
import { API } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    // Get the actual teacher record to get teacher.id
    const teacher = await prisma.teacher.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!teacher) return API.notFound('Teacher profile not found');
    const teacherId = teacher.id;

    // 1. Get Global Ranking List (Cached for 1 hour)
    const sortedInstructorIds = await cacheData('teacher:rankings:global_list', async () => {
      // Aggregate revenue for all teachers
      const teacherRevenues = await prisma.transaction.groupBy({
        by: ['courseId'],
        _sum: { amount: true },
        where: { status: 'succeeded' }
      });

      const courses = await prisma.course.findMany({
        select: { id: true, instructorId: true }
      });

      const instructorRevenueMap: Record<string, number> = {};
      teacherRevenues.forEach(rev => {
        const course = courses.find(c => c.id === rev.courseId);
        if (course && course.instructorId) {
          instructorRevenueMap[course.instructorId] = (instructorRevenueMap[course.instructorId] || 0) + (rev._sum.amount || 0);
        }
      });

      return Object.entries(instructorRevenueMap)
        .sort(([, a], [, b]) => b - a)
        .map(([id]) => id);
    }, 3600); // 1 hour cache

    // 2. Calculate Specific Teacher Stats
    const totalTeachers = sortedInstructorIds.length || 1;
    const teacherIndex = sortedInstructorIds.findIndex((id: string) => id === teacherId);
    const position = teacherIndex === -1 ? totalTeachers : teacherIndex + 1;
    const percentile = Math.round(((totalTeachers - position + 1) / totalTeachers) * 100);

    return API.ok({ position, total: totalTeachers, percentile });

  } catch (error: any) {
    console.error('❌ Ranking Engine Failure:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Ranking synchronization failed');
  }
}

