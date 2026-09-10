export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withResiliency } from '@/lib/resilient-db';

export async function GET(req: NextRequest) {
  try {
    // 1. Check authentication using custom auth helper
    const userSession = await getCurrentUser();
    
    if (!userSession?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', courses: [], success: false },
        { status: 401 }
      );
    }

    // 2. Fetch enrolled courses with resiliency and per-user caching
    const enrollmentsRes = await withResiliency(
      () => prisma.enrollment.findMany({
        where: {
          userId: userSession.id,
        },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  avatar_url: true,
                  image: true,
                },
              },
              Category: true,
              lessons: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                },
              },
              courseReviews: {
                select: {
                  rating: true,
                },
              },
              certificates: {
                where: {
                  userId: userSession.id
                },
                select: {
                  id: true,
                  issuedAt: true,
                  certificateUrl: true,
                }
              }
            },
          },
          progress: {
            select: {
              lessonId: true,
              completed: true,
              completedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      `user-enrollments-${userSession.id}`
    );

    const enrollments = enrollmentsRes.data;

    if (!enrollmentsRes.success || !enrollments) {
      return NextResponse.json({
        courses: [],
        success: false,
        isCachedFallback: true,
        message: 'Database is temporarily under heavy load. Please try again later.'
      });
    }

    // 3. Transform data for frontend
    const courses = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.progress.filter(p => p.completed).length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      // Calculate average rating from courseReviews
      const avgRating = enrollment.course.courseReviews.length > 0
        ? enrollment.course.courseReviews.reduce((sum, r) => sum + r.rating, 0) / enrollment.course.courseReviews.length
        : 0;

      const certificate = enrollment.course.certificates?.[0];

      return {
        id: enrollment.course.id,
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        category: enrollment.course.Category?.name || 'Uncategorized',
        price: Number(enrollment.course.price),
        instructor: {
          name: enrollment.course.instructor.name || 'Instructor',
          avatar: enrollment.course.instructor.avatar_url || enrollment.course.instructor.image || '/placeholder-avatar.jpg',
        },
        rating: parseFloat(avgRating.toFixed(1)) || 0,
        totalStudents: enrollment.course.enrolledStudentsCount || 0,
        progress: {
          percentage,
          completedLessons,
          totalLessons,
          lastAccessedAt: enrollment.lastAccessedAt 
            ? new Date(enrollment.lastAccessedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : undefined,
        },
        status: percentage === 100 ? 'completed' : percentage > 0 ? 'in-progress' : 'not-started',
        enrolledAt: enrollment.createdAt.toISOString(),
        isBookmarked: enrollment.isBookmarked || false,
        certificate: certificate ? {
          issued: true,
          issuedAt: certificate.issuedAt?.toISOString(),
          url: certificate.certificateUrl,
        } : undefined,
      };
    });

    return NextResponse.json({
      courses,
      success: true,
      count: courses.length,
    });

  } catch (error) {
    console.error('Failed to fetch enrolled courses:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch enrolled courses', 
        courses: [], 
        success: false 
      },
      { status: 500 }
    );
  }
}

