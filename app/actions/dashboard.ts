'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { withResiliency } from '@/lib/resilient-db';


// Helper to get current user from token in cookies
async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return { id: session.userId, role: session.role };
}

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const res = await withResiliency(async () => {
      const [userData, enrollments, upcomingSeminars, latestStreak, totalWatched] = await Promise.all([
        // 1. User Stats
        prisma.user.findUnique({
          where: { id: user.id },
          select: {
            name: true,
            totalPoints: true,
            _count: {
              select: { certificates: true }
            }
          }
        }),

        // 2. Enrolled Courses & Progress
        prisma.enrollment.findMany({
          where: { userId: user.id, status: 'active' },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                lessons: {
                  select: { id: true, duration: true },
                }
              }
            },
            progress: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
              include: {
                lesson: true
              }
            }
          },
          orderBy: { lastAccessedAt: 'desc' },
          take: 4
        }),

        // 3. Upcoming Seminars
        prisma.seminar.findMany({
          where: {
            status: { in: ['SCHEDULED', 'LIVE'] },
            scheduledAt: { gte: new Date() }
          },
          orderBy: { scheduledAt: 'asc' },
          take: 3,
          include: {
            speaker: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }),

        // 4. Latest Streak
        prisma.streak.findFirst({
          where: { userId: user.id },
          orderBy: { startDate: 'desc' },
          select: { length: true }
        }),

        // 5. Total Watched Time
        prisma.progress.aggregate({
          where: { userId: user.id },
          _sum: { watchedTime: true }
        })
      ]);

      return { userData, enrollments, upcomingSeminars, latestStreak, totalWatched };
    });

    if (!res.success || !res.data) throw new Error(res.error || 'DASHBOARD_FETCH_FAILED');
    
    const { userData, enrollments, upcomingSeminars, latestStreak, totalWatched } = res.data;

    // Transform Data for UI
    const totalSeconds = totalWatched._sum.watchedTime || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeSpentFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Continue Learning (Most recent active course)
    const lastActiveEnrollment = enrollments[0];
    const continueLearning = lastActiveEnrollment ? {
      courseTitle: lastActiveEnrollment.course.title,
      thumbnail: lastActiveEnrollment.course.thumbnail || '/placeholder-course.jpg',
      lessonTitle: lastActiveEnrollment.progress[0]?.lesson.title || 'Start Course',
      moduleTitle: 'Current Lesson',
      progress: lastActiveEnrollment.progressPercentage || 0,
      timeLeft: `${Math.max(0, 100 - (lastActiveEnrollment.progressPercentage || 0))}% left`,
      lessonId: lastActiveEnrollment.progress[0]?.lessonId,
      courseId: lastActiveEnrollment.courseId
    } : null;

    // Calculate total lessons and completed across all courses
    let totalLessonsAcrossAll = 0;
    let totalCompletedAcrossAll = 0;

    enrollments.forEach(e => {
      const count = e.course.lessons.length;
      totalLessonsAcrossAll += count;
      totalCompletedAcrossAll += Math.round((e.progressPercentage || 0) / 100 * count);
    });

    const overallProgress = totalLessonsAcrossAll > 0
      ? Math.round((totalCompletedAcrossAll / totalLessonsAcrossAll) * 100)
      : 0;

    // 6. Pending Assignments count
    const pendingAssignmentsCount = await prisma.assignment.count({
      where: {
        lesson: { courseId: { in: enrollments.map(e => e.courseId) } },
        submissions: { none: { userId: user.id } }
      }
    });

    // 7. Calculate Achievements
    const achievements: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      color: string;
      unlocked: boolean;
      progress: number;
    }> = [];

    // Tech Pioneer: Completed at least 1 course
    const completedCoursesCount = enrollments.filter(e => (e.progressPercentage || 0) === 100).length;
    if (completedCoursesCount > 0) {
      achievements.push({
        id: 'tech-pioneer',
        title: 'Tech Pioneer',
        description: 'Completed your first course',
        icon: 'Zap',
        color: 'orange',
        unlocked: true,
        progress: 100
      });
    } else {
      achievements.push({
        id: 'tech-pioneer',
        title: 'Tech Pioneer',
        description: 'Complete 1 course to unlock',
        icon: 'Zap',
        color: 'gray',
        unlocked: false,
        progress: enrollments.length > 0 ? (enrollments[0].progressPercentage || 0) : 0
      });
    }

    // Scholar: Earned 500+ XP
    if (userData?.totalPoints && userData.totalPoints > 500) {
      achievements.push({
        id: 'scholar',
        title: 'Scholar',
        description: 'Earned 500+ XP',
        icon: 'Award',
        color: 'blue',
        unlocked: true,
        progress: 100
      });
    } else {
      achievements.push({
        id: 'scholar',
        title: 'Scholar',
        description: 'Earn 500 XP to unlock',
        icon: 'Award',
        color: 'gray',
        unlocked: false,
        progress: Math.min(100, ((userData?.totalPoints || 0) / 500) * 100)
      });
    }

    // Streak Master
    if (latestStreak?.length && latestStreak.length >= 7) {
      achievements.push({
        id: 'streak-master',
        title: 'Streak Master',
        description: '7-day learning streak',
        icon: 'Flame',
        color: 'red',
        unlocked: true,
        progress: 100
      });
    } else {
      achievements.push({
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Reach 7-day streak',
        icon: 'Flame',
        color: 'gray',
        unlocked: false,
        progress: Math.min(100, ((latestStreak?.length || 0) / 7) * 100)
      });
    }

    return {
      user: userData,
      stats: {
        completedLessons: totalCompletedAcrossAll,
        totalLessons: totalLessonsAcrossAll,
        overallProgress,
        points: userData?.totalPoints || 0,
        coursesEnrolled: enrollments.length,
        totalCourses: enrollments.length,
        certificates: userData?._count?.certificates || 0,
        timeSpent: timeSpentFormatted,
        streak: latestStreak?.length || 0,
        pendingAssignments: pendingAssignmentsCount
      },
      achievements,
      continueLearning,
      enrolledCourses: enrollments.map(e => ({
        id: e.course.id,
        title: e.course.title,
        progress: e.progressPercentage,
        totalLessons: e.course.lessons.length,
        completedLessons: Math.round((e.progressPercentage || 0) / 100 * e.course.lessons.length),
        thumbnail: e.course.thumbnail
      })),
      upcomingSeminars: upcomingSeminars.map(s => ({
        id: s.id,
        title: s.title,
        startTime: s.scheduledAt,
        host: s.speaker?.user?.name || 'TBA',
        status: (s.status === 'LIVE' ? 'live' : 'upcoming') as 'live' | 'upcoming',
        duration: s.durationMinutes || 60
      })),
      dailyGoal: continueLearning ? `Complete next lesson in ${continueLearning.courseTitle}` : "Enroll in a new course to start learning!",
    };
  } catch (error) {
    console.error('Final failure in getDashboardData:', error);

    // Ultimate minimal safe state return on critical DB failure
    return {
      user: { name: 'Student' },
      stats: { completedLessons: 0, points: 0, coursesEnrolled: 0, certificates: 0, timeSpent: '0h', streak: 0, overallProgress: 0, pendingAssignments: 0 },
      achievements: [],
      continueLearning: null,
      enrolledCourses: [],
      upcomingSeminars: [],
      dailyGoal: 'Database connection issue. Please refresh.',
      nextSession: 'Connection issue',
      error: true
    };
  }
}

