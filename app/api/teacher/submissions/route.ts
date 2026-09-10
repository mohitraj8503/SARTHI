import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending'; // pending, graded, all

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build where clause
    const whereClause: Prisma.SubmissionWhereInput = {
      lesson: {
        course: {
          instructorId: user.id,
        },
      },
    };

    if (status !== 'all') {
      if (status === 'pending') {
        // Find SUBMITTED or PENDING
        whereClause.status = { in: ['SUBMITTED', 'PENDING'] };
      } else if (status === 'graded') {
        whereClause.status = 'GRADED';
      }
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform
    const transformedSubmissions = submissions.map((sub) => ({
      id: sub.id,
      student: {
        id: sub.user.id,
        name: sub.user.name,
        email: sub.user.email,
      },
      assignment: {
        id: sub.lesson.id,
        title: sub.lesson.title,
        maxScore: 100, // Defaulting as not in schema currently
        courseId: sub.lesson.course.id,
        courseTitle: sub.lesson.course.title,
      },
      status: sub.status.toLowerCase(), // PENDING -> pending
      score: sub.grade,
      feedback: sub.feedback,
      submittedAt: sub.createdAt,
      content: sub.content || '',
      fileUrl: sub.fileUrl,
    }));

    return NextResponse.json({ submissions: transformedSubmissions });
  } catch (error) {
    console.error('[TeacherSubmissions] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

