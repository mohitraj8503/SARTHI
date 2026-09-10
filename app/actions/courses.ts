'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function getEnrolledCourses() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            thumbnail: true,
            level: true,
            duration: true,
            instructor: { select: { name: true } },
            _count: { select: { lessons: true } },
            lessons: {
              where: { isPublished: true },
              take: 1,
              orderBy: { position: 'asc' },
              select: { id: true, title: true }
            }
          }
        },
        progress: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          select: {
            lessonId: true,
            lesson: { select: { title: true } }
          }
        }
      },
      orderBy: { lastAccessedAt: 'desc' }
    });
 
    return enrollments.map(e => {
       const progressEntry = e.progress?.[0];
       let resumePoint;
       if (progressEntry) {
         resumePoint = {
           lessonId: progressEntry.lessonId,
           lessonTitle: progressEntry.lesson?.title
         };
       } else {
         const firstLesson = e.course?.lessons?.[0];
         resumePoint = {
           lessonId: firstLesson?.id,
           lessonTitle: firstLesson?.title
         };
       }

        return {
          id: e.course?.id,
          slug: e.course?.slug,
          title: e.course?.title || 'Unknown Course',
          description: e.course?.description,
          thumbnail: e.course?.thumbnail,
          difficulty: e.course?.level,
          duration: e.course?.duration,
          progress: e.progressPercentage,
          totalLessons: e.course?._count?.lessons || 0,
          completedLessons: Math.round((e.progressPercentage || 0) / 100 * (e.course?._count?.lessons || 0)),
          lastAccessed: e.lastAccessedAt,
          instructor: e.course?.instructor?.name || 'Expert',
          resumePoint
        };
    });
  } catch (error: any) {
    console.error('DASHBOARD_ENROLLMENT_FAIL:', error?.message || error);
    
    // Check for connection/auth errors
    const isDbDown = error?.code === 'P1001' || error?.message?.includes('database') || error?.message?.includes('Authentication');
    
    if (isDbDown) {
      return [];
    }
    return { error: 'DB_CONNECTION_FAILED' };
  }
}

export async function getCourseById(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true }
    });
    return course;
  } catch {
    return { error: 'DB_CONNECTION_FAILED' };
  }
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    category: string;
    level: string;
    rating: number;
    reviewCount: number;
    instructor: {
       name: string;
       image: string | null;
       bio: string | null;
    };
    totalLessons: number;
    enrolledCount: number;
    price: number;
    isFree: boolean;
    totalDuration: number; // in minutes
}

export async function getPublishedCourses(): Promise<{ 
  data: Course[]; 
  isMock: boolean; 
  error?: string 
}> {
    try {
      const courses = await prisma.course.findMany({
        where: { publish_state: "published" },
        include: {
          instructor: {
            select: { id: true, name: true, image: true, bio: true }
          },
          courseReviews: {
            select: { rating: true }
          },
          _count: {
            select: { lessons: true, enrollments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        data: courses.map(c => {
          const ratings = c.courseReviews.map(r => r.rating);
          const avgRating = ratings.length > 0
            ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 4.5;

          return {
            id: c.id,
            title: c.title,
            description: c.description,
            thumbnail: c.thumbnail,
            level: c.level,
            rating: avgRating,
            reviewCount: c.courseReviews.length,
            instructor: {
              name: c.instructor?.name || 'Unknown',
              image: c.instructor?.image,
              bio: c.instructor?.bio
            },
            totalLessons: c._count?.lessons || 0,
            enrolledCount: c._count?.enrollments || 0,
            price: Number(c.effective_price_amount || c.price || 0),
            isFree: c.pricing_type === 'FREE' || Number(c.price) === 0,
            totalDuration: c.duration || 0,
            category: typeof c.category === 'string' ? c.category : 'General'
          };
        }), isMock: false
      };
    } catch (error: any) {
      if (error?.code === 'P1001' || error?.message?.includes('database connection')) {
        return {
          isMock: false,
          error: 'DB_CONNECTION_FAILED',
          data: [] as Course[]
        };
      }
       return { error: 'DB_CONNECTION_FAILED', data: [] as Course[], isMock: false };
    }
  }

