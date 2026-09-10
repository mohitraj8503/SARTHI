import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateQueryParams } from '@/lib/api-validator';
import { z } from 'zod';
import type { ApiResponse, DashboardQuizListItem, PaginatedResponse } from '@/lib/types/dashboard';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(30).default(12),
  q: z.string().trim().optional(),
  status: z.enum(['pending', 'completed', 'overdue', 'all']).default('all'),
});

export async function GET(req: NextRequest) {
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

  const query = validateQueryParams(req, querySchema);
  if (!query.success) return query.error;

  const { page, pageSize, q, status } = query.data;
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: 'active' },
    select: { courseId: true }
  });
  const courseIds = enrollments.map((item) => item.courseId);

  const quizzes = await prisma.quiz.findMany({
    where: {
      courseId: { in: courseIds },
      ...(q ? { title: { contains: q } } : {}),
    },
    include: {
      course: { select: { title: true } },
      questions: { select: { id: true } },
      submissions: {
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  let mapped: DashboardQuizListItem[] = quizzes.map((quiz) => {
    const latest = quiz.submissions[0];
    const bestScore = quiz.submissions.length > 0
      ? Math.max(...quiz.submissions.map((submission) =>
          submission.maxScore > 0 ? Math.round((submission.score / submission.maxScore) * 100) : 0
        ))
      : null;

    return {
      id: quiz.id,
      title: quiz.title,
      course: quiz.course.title,
      questions: quiz.questions.length,
      duration: quiz.timeLimit,
      status: latest ? 'completed' : 'pending',
      dueDate: null,
      attempts: quiz.submissions.length,
      bestScore,
    };
  });

  if (status !== 'all') {
    mapped = mapped.filter((item) => item.status === status);
  }

  const start = (page - 1) * pageSize;
  const data: PaginatedResponse<DashboardQuizListItem> = {
    items: mapped.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: mapped.length,
      totalPages: Math.max(1, Math.ceil(mapped.length / pageSize)),
    },
  };

  return NextResponse.json<ApiResponse<PaginatedResponse<DashboardQuizListItem>>>(
    { success: true, data },
    { headers: limited.headers }
  );
}

