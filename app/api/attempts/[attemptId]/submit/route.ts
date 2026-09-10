import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/attempts/[attemptId]/submit
 * Submit an assignment attempt, evaluate score, and update progress.
 */
export async function POST(request: Request, props: { params: Promise<{ attemptId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const attemptId = params.attemptId;

    // 1. Fetch attempt with answers and question keys
    const attempt = await prisma.assignmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: {
          include: { questions: true }
        },
        answers: true
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Attempt already submitted or closed' }, { status: 400 });
    }

    // 2. Evaluation Engine
    let totalScore = 0;
    let maxPossibleScore = 0;

    const evaluationPromises = attempt.assignment.questions.map(async (question) => {
      maxPossibleScore += question.marks;
      
      const studentAnswer = attempt.answers.find(a => a.questionId === question.id);
      const isCorrect = studentAnswer?.selectedOption === question.correctOption;
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks;
      } else if (studentAnswer?.selectedOption) {
        marksAwarded = -question.negativeMarks;
      }

      totalScore += marksAwarded;

      // Update answer record
      return prisma.attemptAnswer.update({
        where: { id: studentAnswer?.id || 'none' },
        data: {
          isCorrect,
          marksAwarded
        }
      }).catch(() => {}); // Handle cases where student didn't answer this question
    });

    await Promise.all(evaluationPromises);

    // 3. Update Attempt Status
    const finalScore = Math.max(0, totalScore); // No negative final scores
    const updatedAttempt = await prisma.assignmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        score: finalScore,
        maxScore: maxPossibleScore,
        isLocked: true
      }
    });

    // 4. Update Student Progress & Restrictions
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: attempt.studentId,
          courseId: attempt.assignment.courseId || ''
        }
      }
    });

    if (enrollment) {
      const newPendingCount = Math.max(0, enrollment.pendingAssignments - 1);
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          pendingAssignments: newPendingCount,
          isRestricted: newPendingCount > 0,
          lastCompletedAssignmentId: attempt.assignmentId
        }
      });
    }

    // 5. Audit Event
    await prisma.assignmentEvent.create({
      data: {
        assignmentId: attempt.assignmentId,
        actorType: 'STUDENT',
        actorId: attempt.studentId,
        eventType: 'SUBMITTED',
        payload: { attemptId, score: finalScore, maxScore: maxPossibleScore }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        score: finalScore,
        maxScore: maxPossibleScore,
        status: 'SUBMITTED'
      }
    });
  } catch (error: any) {
    console.error('[API/Attempts/Submit] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
