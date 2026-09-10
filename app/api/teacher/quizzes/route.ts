import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        course: {
          instructorId: teacher.userId
        }
      },
      include: {
        course: {
          select: { title: true }
        },
        _count: {
          select: { questions: true, submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('[Quizzes GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const data = await request.json();
    const { title, courseId, timeLimit, passingScore, questions } = data;

    if (!title || !courseId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        courseId,
        timeLimit: parseInt(timeLimit) || 30,
        passingScore: parseInt(passingScore) || 60,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: parseInt(q.correctAnswer),
            points: parseInt(q.points) || 10,
            orderNumber: index
          }))
        }
      }
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error('[Quizzes POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

