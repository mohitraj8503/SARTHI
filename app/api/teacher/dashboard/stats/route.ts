import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { cacheData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    const stats = await cacheData(
      `dashboard:stats:${userId}`,
      async () => {
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

        // Fetch teacher's courses first
        const courses = await prisma.course.findMany({
          where: courseQueryFilter,
          select: { id: true }
        });
        const courseIds = courses.map(c => c.id);

        if (courseIds.length === 0) {
          return {
            totalStudents: 0,
            activeCourses: 0,
            totalRevenue: 0,
            lessonsDelivered: 0
          };
        }

        const [totalStudents, activeCourses, totalRevenue, lessonsDelivered] = await Promise.all([
          // Total Students (Distinct)
          prisma.enrollment.count({
            where: { courseId: { in: courseIds }, status: 'active' }
          }),
          // Active Courses (Published)
          prisma.course.count({
            where: {
              AND: [
                courseQueryFilter,
                { isPublished: true }
              ]
            }
          }),
          // Total Revenue
          prisma.transaction.aggregate({
            where: { courseId: { in: courseIds }, status: { in: ['succeeded', 'SUCCESS'] } },
            _sum: { amount: true }
          }).then(res => res._sum.amount || 0),
          // Lessons Delivered (Progress completed)
          prisma.progress.count({
            where: { 
              enrollment: { courseId: { in: courseIds } },
              completed: true 
            }
          })
        ]);

        return {
          totalStudents,
          activeCourses,
          totalRevenue,
          lessonsDelivered
        };
      },
      60 // 1 minute cache
    );

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Stats] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

