'use server';

import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getCurrentUser } from '@/lib/auth';

export async function getQuizzes() {
  const user = await getCurrentUser();
  // Unauthenticated users get empty array (not mock data!)
  if (!user) return [];

  try {
    return await withResiliency(async () => {
      // Get user's enrollments to find relevant quizzes
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id, status: 'active' },
        select: { courseId: true }
      });

      const courseIds = enrollments.map(e => e.courseId);

      // If user has no enrollments, return empty array (not fake quizzes!)
      if (courseIds.length === 0) {
        return [];
      }

      // Try to find quizzes - this may fail if schema doesn't have Quiz model
      try {
        const quizzes = await prisma.quiz.findMany({
          where: {
            courseId: { in: courseIds }
          },
          include: {
            course: { select: { title: true } },
            questions: { select: { id: true } },
            submissions: {
              where: { userId: user.id },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (quizzes.length > 0) {
          return quizzes.map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            course: quiz.course?.title || 'Unknown Course',
            questions: quiz.questions?.length || 0,
            duration: quiz.timeLimit || 20,
            status: quiz.submissions?.length ? 'completed' as const : 'pending' as const,
            dueDate: null,
            attempts: quiz.submissions?.length || 0,
            bestScore: quiz.submissions?.length
              ? Math.max(
                  ...quiz.submissions.map((submission: any) =>
                    submission.maxScore > 0 ? Math.round((submission.score / submission.maxScore) * 100) : 0
                  )
                )
              : null
          }));
        }
      } catch (e) {
        // Quiz model might not exist
        console.log('Quiz model not found, returning empty array');
      }

      // No quizzes found - return empty array (NOT mock data!)
      return [];
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    // In production, return empty array instead of fake data
    return [];
  }
}

export async function getQuizStats() {
  const res = await getQuizzes() as any;
  const quizzes = res.data || [];
  
  if (!res.success) {
    return {
      pending: 0,
      overdue: 0,
      completed: 0,
      averageScore: 0,
      totalPoints: 0
    };
  }

  const pendingQuizzes = quizzes.filter(q => q.status === 'pending');
  const completedQuizzes = quizzes.filter(q => q.status === 'completed');
  const overdueQuizzes = quizzes.filter(q => (q.status as string) === 'overdue');
  const totalPoints = completedQuizzes.reduce((acc, q) => acc + (q.bestScore || 0), 0);

  return {
    pending: pendingQuizzes.length,
    overdue: overdueQuizzes.length,
    completed: completedQuizzes.length,
    averageScore: completedQuizzes.length > 0
      ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.bestScore || 0), 0) / completedQuizzes.length)
      : 0,
    totalPoints
  };
}

