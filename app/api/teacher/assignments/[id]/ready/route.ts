import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/teacher/assignments/[id]/ready
 * Mark an assignment as READY for release.
 */
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const assignmentId = params.id;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { _count: { select: { questions: true } } }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Validation: Check question count
    if (assignment._count.questions < assignment.totalQuestions) {
      return NextResponse.json({ 
        error: `Incomplete assignment. Requires ${assignment.totalQuestions} questions, but only ${assignment._count.questions} added.` 
      }, { status: 400 });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: 'READY' }
    });

    // Audit Event
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
    await prisma.assignmentEvent.create({
      data: {
        assignmentId: assignment.id,
        actorType: 'TEACHER',
        actorId: teacher?.id || session.userId,
        eventType: 'UPDATED',
        payload: { status: 'READY' }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedAssignment
    });
  } catch (error: any) {
    console.error('[API/Teacher/Assignments/Ready] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
