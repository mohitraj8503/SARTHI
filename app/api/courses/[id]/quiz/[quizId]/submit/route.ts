export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string; quizId: string }> }) {
  const params = await props.params;
  try {
    const { id: courseId, quizId } = params;
    const { answers } = await req.json(); // Record<questionIndex, selectedOptionIndex>

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    // Fetch quiz content (lesson)
    const lesson = await prisma.lesson.findUnique({
      where: { id: quizId },
    });

    if (!lesson || !lesson.content) {
      return NextResponse.json({ message: 'Quiz content not found' }, { status: 404 });
    }

    const questions: any[] = JSON.parse(lesson.content);
    let correctCount = 0;
    const totalQuestions = questions.length;

    // Calculate Score
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= (lesson.passingScore || 60);
    const maxScore = lesson.maxScore || 100;
    const finalGrade = Math.round((scorePercentage / 100) * maxScore);

    // Save submission
    const submission = await prisma.submission.upsert({
      where: {
        userId_lessonId: { userId, lessonId: quizId },
      },
      update: {
        grade: finalGrade,
        feedback: `Auto-graded: ${correctCount}/${totalQuestions} correct (${scorePercentage}%).`,
        status: 'GRADED',
        passed: passed,
      },
      create: {
        lessonId: quizId,
        userId,
        grade: finalGrade,
        feedback: `Auto-graded: ${correctCount}/${totalQuestions} correct (${scorePercentage}%).`,
        status: 'GRADED',
        passed: passed,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId,
        title: passed ? 'Quiz Passed! 🎉' : 'Quiz Failed',
        body: `You scored ${scorePercentage}% on ${lesson.title}. Result: ${passed ? 'PASSED' : 'FAILED'
          }`,
        type: passed ? 'success' : 'warning',
        isRead: false,
      },
    });

    return NextResponse.json({
      score: finalGrade,
      maxScore,
      percentage: scorePercentage,
      passed,
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
