import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/live-class/create
 *
 * Instructor creates a scheduled LiveKit-based live class.
 * Body: { courseId, title, description?, scheduledAt? }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers / admins may create live classes
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const isTeacher =
      user?.role === 'TEACHER' ||
      user?.role === 'INSTRUCTOR' ||
      user?.role === 'ADMIN' ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'GOD_ADMIN';

    if (!isTeacher) {
      return NextResponse.json({ error: 'Only instructors can create live classes' }, { status: 403 });
    }

    const body = await req.json();
    const { courseId, title, description, scheduledAt } = body;

    if (!courseId || !title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    // Verify the teacher is associated with this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true, instructorId: true, title: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check teacher owns this course (skip check for admins)
    if (user?.role === 'TEACHER' || user?.role === 'INSTRUCTOR') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      const isInstructorMatch = course.instructorId === session.userId;
      const isTeacherMatch = teacher && course.teacherId === teacher.id;

      if (!isInstructorMatch && !isTeacherMatch) {
        return NextResponse.json({ error: 'You are not the instructor of this course' }, { status: 403 });
      }
    }

    // Generate a unique LiveKit room name
    const roomName = `lk-${courseId}-${Date.now()}`;

    const liveClass = await prisma.liveClass.create({
      data: {
        courseId,
        teacherId: session.userId,
        title,
        description: description || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'SCHEDULED' as any,
        roomName,
        liveKitStatus: 'SCHEDULED',
      },
      select: {
        id: true,
        courseId: true,
        title: true,
        description: true,
        scheduledAt: true,
        status: true,
        roomName: true,
        liveKitStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, liveClass });
  } catch (error: any) {
    console.error('[live-class/create]', error);
    return NextResponse.json({ error: 'Failed to create live class', details: error?.message }, { status: 500 });
  }
}
