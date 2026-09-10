export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { nextEnrollmentNo, nextEnrollmentCode } from '@/lib/enrollment';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();

    // Robust admin check (case-insensitive)
    const userRole = session?.role;
    const isAdmin =
      userRole &&
      (userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'ADMINISTRATOR');

    if (!session || !isAdmin) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { studentId, courseId } = await req.json();

    // Validate input; support both studentId (frontend) and userId (legacy/api)
    const targetUserId = studentId;

    if (!targetUserId || !courseId) {
      return NextResponse.json({ error: 'Missing studentId or courseId' }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.$transaction(async (tx) => {
      const { nextEnrollmentNo, nextEnrollmentCode, ensureUserEnrollmentNumber } = await import('@/lib/enrollment');

      // Ensure user has an enrollment number
      await ensureUserEnrollmentNumber(targetUserId, tx);

      const eNo = await nextEnrollmentNo(tx);
      const eCode = await nextEnrollmentCode(eNo, tx);

      return await tx.enrollment.create({
        data: {
          userId: targetUserId,
          courseId,
          status: 'active',
          enrolledBy: 'admin_manual',
          enrolledByUserId: session.id,
          enrollmentNo: eNo,
          enrollmentCode: eCode,
        },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      });
    });

    // Log platform activity
    await prisma.platformActivity.create({
      data: {
        type: 'enrollment',
        userId: targetUserId,
        data: JSON.stringify({
          description: `Manually enrolled in "${enrollment.course.title}" by Admin`,
          userName: enrollment.user.name || enrollment.user.email,
          courseTitle: enrollment.course.title,
          adminName: session.name || 'Admin',
          manual: true,
        }),
      },
    });

    // Increment enrolled students count on the course
    await prisma.course.update({
      where: { id: courseId },
      data: { enrolledStudentsCount: { increment: 1 } }
    }).catch(err => console.error('[AdminEnroll] EnrollCount increment failed:', err));

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error: any) {
    console.error('Manual enrollment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enroll student' },
      { status: 500 }
    );
  }
}

