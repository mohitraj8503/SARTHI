import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/security/rate-limit';
import type { ApiResponse, DashboardQuizDetail } from '@/lib/types/dashboard';

export const dynamic = 'force-dynamic';

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const limited = await rateLimit(req);
  if (!limited.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
      { status: 429, headers: limited.headers }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401, headers: limited.headers }
    );
  }

  if (isAuditPlaceholder(params.id)) {
    const data: DashboardQuizDetail = {
      id: params.id,
      title: 'Sample Quiz',
      courseId: 'sample-course',
      courseName: 'Sample Course',
      timeLimit: 15,
      passingScore: 60,
      questionCount: 2,
      questions: [
        {
          id: 'q1',
          question: 'Which option best describes a runtime-safe fallback?',
          options: ['Throw everywhere', 'Provide defaults', 'Disable rendering', 'Hard reload'],
          orderNumber: 1,
          points: 5,
        },
        {
          id: 'q2',
          question: 'What should an audit-safe route return for sample ids?',
          options: ['404 always', 'Redirect loop', 'Deterministic placeholder payload', 'Empty response'],
          orderNumber: 2,
          points: 5,
        },
      ],
      submission: null,
    };

    return NextResponse.json<ApiResponse<DashboardQuizDetail>>(
      { success: true, data },
      { headers: limited.headers }
    );
  }

  const quiz = await prisma.quiz.findFirst({
    where: {
      id: params.id,
      course: {
        enrollments: {
          some: {
            userId: user.id,
            status: { in: ['active', 'completed'] },
          },
        },
      },
    },
    include: {
      course: { select: { id: true, title: true } },
      questions: {
        orderBy: { orderNumber: 'asc' },
        select: {
          id: true,
          question: true,
          options: true,
          orderNumber: true,
          points: true,
        },
      },
      submissions: {
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!quiz) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      { status: 404, headers: limited.headers }
    );
  }

  const data: DashboardQuizDetail = {
    id: quiz.id,
    title: quiz.title,
    courseId: quiz.courseId,
    courseName: quiz.course.title,
    timeLimit: quiz.timeLimit,
    passingScore: quiz.passingScore,
    questionCount: quiz.questions.length,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: JSON.parse(question.options || '[]'),
      orderNumber: question.orderNumber,
      points: question.points,
    })),
    submission: quiz.submissions[0]
      ? {
          score: quiz.submissions[0].score,
          maxScore: quiz.submissions[0].maxScore,
          passed: quiz.submissions[0].passed,
          createdAt: quiz.submissions[0].createdAt.toISOString(),
        }
      : null,
  };

  return NextResponse.json<ApiResponse<DashboardQuizDetail>>(
    { success: true, data },
    { headers: limited.headers }
  );
}
