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

    const enrollments = await cacheData(
      `dashboard:enrollments:${userId}`,
      async () => {
        const rawRecentEnrollments = await prisma.enrollment.findMany({
          where: { course: { instructorId: userId }, status: 'active' },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
            course: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        return rawRecentEnrollments.map(e => ({
          id: e.id,
          studentName: e.user.name,
          studentImage: e.user.image,
          studentEmail: e.user.email,
          courseName: e.course.title,
          date: e.createdAt,
        }));
      },
      60
    );

    return NextResponse.json(enrollments, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Enrollments] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

