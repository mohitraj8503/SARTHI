export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, score, feedback } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('tt_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const userId = payload.userId;

    // Verify ownership
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.lesson.course.instructorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: score,
        feedback: feedback,
        status: 'GRADED',
        gradedById: userId,
        gradedAt: new Date(),
      },
    });

    // Create Student Notification (Inbox)
    await prisma.notification.create({
      data: {
        userId: submission.userId,
        title: 'Assignment Graded 📝',
        body: `Your assignment for ${submission.lesson.title} has been graded: ${score}/100.`,
        type: 'info',
        isRead: false,
      },
    });
    
    // Log platform activity for Admins (Activity Feed)
    import('@/lib/events').then(({ logActivity }) => {
      logActivity(prisma, {
        type: 'grading',
        action: 'ASSIGNMENT_GRADED',
        source: 'teachers',
        severity: 'info',
        actorName: payload.name || 'Teacher',
        userId: userId,
        targetName: `Submission for ${submission.lesson.title}`,
        targetId: submissionId,
        targetType: 'course',
        metadata: { score, feedback, studentId: submission.userId }
      });
    }).catch(err => console.error('[ActivityLog] Grading log failed:', err));

    return NextResponse.json({ success: true, submission: updatedSubmission });
  } catch (error: any) {
    console.error('[TeacherGrading] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grade submission' },
      { status: 500 }
    );
  }
}

