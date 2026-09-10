import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/teacher/assignments/[id]/questions
 * List all questions for a specific assignment.
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const assignmentId = params.id;

    const questions = await prisma.assignmentQuestion.findMany({
      where: { assignmentId },
      orderBy: { orderIndex: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (error: any) {
    console.error('[API/Teacher/Assignments/Questions] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/teacher/assignments/[id]/questions
 * Add a new MCQ question to the assignment.
 */
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const assignmentId = params.id;
    const body = await request.json();
    const { 
      prompt, 
      optionA, 
      optionB, 
      optionC, 
      optionD, 
      correctOption, 
      explanation,
      marks = 1,
      negativeMarks = 0
    } = body;

    if (!prompt || !optionA || !optionB || !correctOption) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current question count for orderIndex
    const count = await prisma.assignmentQuestion.count({
      where: { assignmentId }
    });

    const question = await prisma.assignmentQuestion.create({
      data: {
        assignmentId,
        prompt,
        optionA,
        optionB,
        optionC: optionC || null,
        optionD: optionD || null,
        correctOption,
        explanation,
        marks: parseInt(marks),
        negativeMarks: parseInt(negativeMarks),
        orderIndex: count
      }
    });

    return NextResponse.json({
      success: true,
      data: question
    });
  } catch (error: any) {
    console.error('[API/Teacher/Assignments/Questions] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
