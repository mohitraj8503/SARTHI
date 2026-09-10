import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * Bulk Grading API for Teachers
 * Allows grading multiple submissions at once to improve efficiency.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { grades } = await request.json(); // Array of { submissionId, score, feedback }

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ error: 'Invalid grades data' }, { status: 400 });
    }

    const results = await prisma.$transaction(
      grades.map((g) =>
        prisma.submission.update({
          where: { id: g.submissionId },
          data: {
            grade: g.score,
            feedback: g.feedback,
            status: 'GRADED',
            gradedById: user.id,
            gradedAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true } },
            lesson: { select: { title: true } }
          }
        })
      )
    );

    // Create notifications for all students
    await Promise.all(
      results.map((sub) =>
        prisma.notification.create({
          data: {
            userId: sub.userId,
            title: 'Assignment Graded 📝',
            body: `Your assignment for ${sub.lesson.title} has been graded: ${sub.grade}/100.`,
            type: 'info',
            isRead: false,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error('[BulkGrading] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process bulk grading' },
      { status: 500 }
    );
  }
}
