export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withResiliency } from '@/lib/resilient-db';

import { API } from '@/lib/api/response';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return API.unauthorized();
  }

  const result = await withResiliency(async () => {
    // 1. Fetch enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            instructor: { select: { name: true } },
            _count: { select: { lessons: true } },
          },
        },
        progress: {
          where: { completed: true },
          select: { lessonId: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch Wishlist (Bookmarks) with course details
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            instructor: { select: { name: true } },
            _count: { select: { lessons: true } },
          },
        },
      }
    });

    const enrolledIds = new Set(enrollments.map(e => e.courseId));
    const bookmarkedCourseIds = new Set(wishlist.map(w => w.courseId));

    // 3. Fetch learning sessions
    const learningSessions = await prisma.learningSession.findMany({
      where: { userId: user.id },
      select: { durationSec: true }
    });

    const totalSeconds = learningSessions.reduce((acc, curr) => acc + (curr.durationSec || 0), 0);
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(1));

    // 4. Transform
    const courses = enrollments.map((e) => {
      const course = e.course;
      const totalLessons = course?._count?.lessons || 0;
      const completedLessons = e.progress?.length || 0;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: course?.id,
        title: course?.title || 'Unknown Course',
        slug: course?.slug,
        thumbnail: course?.thumbnail,
        instructor: course?.instructor?.name || 'Expert Faculty',
        progress: progress,
        enrolledAt: e.createdAt?.toISOString(),
        isBookmarked: bookmarkedCourseIds.has(e.courseId),
        isEnrolled: true
      };
    });

    // 5. Add bookmarked but not enrolled courses
    wishlist.forEach(w => {
      if (!enrolledIds.has(w.courseId)) {
        const course = w.course;
        courses.push({
          id: course?.id,
          title: course?.title || 'Unknown Course',
          slug: course?.slug,
          thumbnail: course?.thumbnail,
          instructor: course?.instructor?.name || 'Expert Faculty',
          progress: 0,
          enrolledAt: null,
          isBookmarked: true,
          isEnrolled: false
        });
      }
    });

    const stats = {
      enrolled: enrollments.length,
      active: courses.filter(c => c.progress > 0 && c.progress < 100).length,
      completed: courses.filter(c => c.progress === 100).length,
      timeStudied: totalHours || 0,
      bookmarked: bookmarkedCourseIds.size,
    };

    return { courses, stats };
  }, `user_my_courses_${user.id}`);

  if (!result.success || !result.data) {
    return API.err(result.error || 'Database error', 'DB_ERROR', 500);
  }

  return API.ok({
    ...result.data,
    count: result.data.courses.length
  });
}

