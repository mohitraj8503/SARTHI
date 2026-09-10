import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateRequestBody } from '@/lib/api-validator';
import { rateLimit } from '@/lib/security/rate-limit';
import type { ApiResponse } from '@/lib/types/dashboard';

export const dynamic = 'force-dynamic';

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.coerce.number().int().min(0)),
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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

  const body = await validateRequestBody(req, submitQuizSchema);
  if (!body.success) return body.error;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id: params.id,
      course: {
        enrollments: {
          some: { userId: user.id, status: { in: ['active', 'completed'] } }
        }
      }
    },
    include: {
      questions: {
        orderBy: { orderNumber: 'asc' }
      }
    }
  });

  if (!quiz) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      { status: 404, headers: limited.headers }
    );
  }

  const answers = body.data.answers;
  const maxScore = quiz.questions.reduce((sum, question) => sum + question.points, 0);
  const score = quiz.questions.reduce((sum, question, index) => {
    const selected = answers[String(index)];
    return sum + (selected === question.correctAnswer ? question.points : 0);
  }, 0);

  const passed = maxScore > 0 ? Math.round((score / maxScore) * 100) >= quiz.passingScore : false;

  const submission = await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score,
      maxScore,
      answer: JSON.stringify(answers),
      passed,
    }
  });

  return NextResponse.json<ApiResponse<{
    submissionId: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  }>>(
    {
      success: true,
      data: {
        submissionId: submission.id,
        score,
        maxScore,
        percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
        passed,
      }
    },
    { headers: limited.headers }
  );
}
