import { prisma } from '@/lib/prisma';

/**
 * Get student context for personalized chatbot responses
 */
export async function getStudentContext(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                level: true,
              }
            }
          }
        },
        progress: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: {
            lesson: {
              select: {
                title: true,
              }
            }
          }
        },
        seminarRegistrations: {
          where: {
            seminar: {
              scheduledAt: { gte: new Date() }
            }
          },
          take: 3,
          include: {
            seminar: {
              select: {
                title: true,
                scheduledAt: true,
              }
            }
          }
        }
      }
    });

    if (!user) return null;

    return {
      studentId: user.id,
      name: user.name || 'Student',
      email: user.email,
      role: user.role,
      onboarded: user.onboarded,
      enrolledCourses: user.enrollments.map(e => ({
        id: e.course?.id,
        title: e.course?.title,
        level: e.course?.level,
      })),
      recentProgress: user.progress.map(p => ({
        lesson: p.lesson?.title,
        completed: p.completed,
        updatedAt: p.updatedAt,
      })),
      upcomingSeminars: user.seminarRegistrations.map(r => ({
        title: r.seminar?.title,
        date: r.seminar?.scheduledAt,
      })),
      stats: {
        totalEnrollments: user.enrollments.length,
        totalPoints: user.totalPoints,
      }
    };
  } catch (error) {
    console.error('Error fetching student context:', error);
    return null;
  }
}

/**
 * Get available courses for recommendations
 */
export async function getAvailableCourses() {
  try {
    return await prisma.course.findMany({
      where: { isPublished: true },
      take: 5,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        price: true,
        level: true,
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}
