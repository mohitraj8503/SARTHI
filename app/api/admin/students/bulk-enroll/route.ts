import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nextEnrollmentNo, nextEnrollmentCode } from '@/lib/enrollment';
import { requireAdmin } from '@/lib/admin/core';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { studentIds, courseId } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0 || !courseId) {
      return NextResponse.json({ error: 'Invalid student IDs or course ID' }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Filter out existing enrollments
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        userId: { in: studentIds },
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(existingEnrollments.map((e) => e.userId));
    const newEnrollments = studentIds
      .filter((id) => !existingUserIds.has(id))
      .map((id) => ({ userId: id, courseId }));

    let count = 0;
    if (newEnrollments.length > 0) {
      for (const enrollmentData of newEnrollments) {
        try {
          const eNo = await nextEnrollmentNo();
          const eCode = await nextEnrollmentCode(eNo);
          await prisma.enrollment.create({
            data: {
              ...enrollmentData,
              enrollmentNo: eNo,
              enrollmentCode: eCode,
              status: 'active',
              enrolledBy: 'bulk_enroll'
            }
          });
          count++;
        } catch (e) {
          console.error(`Failed to enroll student ${enrollmentData.userId}:`, e);
        }
      }
    }

    return NextResponse.json({
      message: `${count} students enrolled successfully in ${course.title}`,
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to bulk enroll students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}

