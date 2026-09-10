import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * GET /api/assignments/[id]
 * Fetch assignment details for students. 
 * Only returns questions if status is RELEASED and student is enrolled.
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const assignmentId = params.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        questions: {
          select: {
            id: true,
            prompt: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            orderIndex: true,
            marks: true
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Security: Check if released
    if (assignment.status !== 'RELEASED' && assignment.status !== 'CLOSED') {
      // Check if user is teacher of the course
      const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
      if (!teacher || teacher.id !== assignment.createdBy) {
        return NextResponse.json({ error: 'Assignment not yet released' }, { status: 403 });
      }
    }

    // Security: Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: assignment.courseId || ''
        }
      }
    });

    if (!enrollment) {
      // Check if user is teacher
      const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
      if (!teacher || teacher.id !== assignment.createdBy) {
        return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
      }
    }

    // Shuffle questions if enabled
    let questions = assignment.questions;
    if (assignment.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...assignment,
        questions
      }
    });
  } catch (error: any) {
    console.error('[API/Assignments] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
