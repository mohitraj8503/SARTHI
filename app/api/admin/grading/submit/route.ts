export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, grade, feedback } = await req.json();

    if (!submissionId || grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update submission with grade
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: parseFloat(grade),
        feedback: feedback || null,
        status: 'GRADED',
        gradedById: user.id,
        gradedAt: new Date(),
        isBeingGraded: false,
        lockedById: null,
        lockedAt: null,
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: submission.userId,
        title: 'Assignment Graded',
        body: `Your submission has been graded. Score: ${grade}`,
        type: 'success',
        href: `/student/submissions/${submissionId}`,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Failed to submit grade:', error);
    return NextResponse.json({ error: 'Failed to submit grade' }, { status: 500 });
  }
}

