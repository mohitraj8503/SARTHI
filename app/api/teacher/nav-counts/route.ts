import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher, AuthenticationError, AuthorizationError } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);

    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: { id: true }
    });

    const courseQueryFilter = {
      OR: [
        { instructorId: userId },
        ...(teacher ? [{ teacherId: teacher.id }] : [])
      ]
    };

    const [courseCount, studentCount] = await Promise.all([
      prisma.course.count({ where: courseQueryFilter }),
      prisma.enrollment.count({ where: { course: courseQueryFilter } }),
    ]);

    return API.ok({
      courseCount,
      studentCount,
      upcomingCount: 0,
      unreadMessages: 0
    });
  } catch (error: any) {
    console.error('❌ Nav Counts API error:', error);
    
    if (error instanceof AuthenticationError) return API.unauthorized();
    if (error instanceof AuthorizationError) return API.forbidden(error.message);

    return API.server('Internal Server Error');
  }
}

