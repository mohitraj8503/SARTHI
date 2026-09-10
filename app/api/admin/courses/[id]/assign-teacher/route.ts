import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/admin/courses/[id]/assign-teacher
 * Action: Assign Primary Teacher (Admin Only)
 */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN' && session?.role !== 'GOD_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { teacherId } = await req.json();
    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // 1. Verify Teacher Role
    const teacherUser = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacher: true }
    });

    if (!teacherUser || (teacherUser.role !== 'TEACHER' && teacherUser.role !== 'INSTRUCTOR')) {
      return NextResponse.json({ error: 'Target user is not a verified teacher' }, { status: 400 });
    }

    const teacherProfileId = teacherUser.teacher?.id;
    if (!teacherProfileId) {
      return NextResponse.json({ error: 'Teacher profile not initialized' }, { status: 400 });
    }

    // 2. Assign to Course
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: { teacherId: teacherProfileId }
    });

    // 3. Log Event
    await prisma.courseEvent.create({
      data: {
        courseId: params.id,
        actorId: session.userId,
        action: 'TEACHER_ASSIGNED',
        payload: { teacherId, teacherName: teacherUser.name }
      }
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
