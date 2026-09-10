export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function ensureOwnership(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (!course) {
    return { valid: false, status: 404, message: 'Course not found' };
  }

  if (course.instructorId !== userId) {
    return { valid: false, status: 403, message: 'Forbidden' };
  }

  return { valid: true };
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { courseId, title } = await req.json();

    if (!courseId || !title) {
      return NextResponse.json({ message: 'Missing courseId or title' }, { status: 400 });
    }

    const ownership = await ensureOwnership(courseId, user.id);
    if (!ownership.valid) {
      return NextResponse.json({ error: ownership.message }, { status: ownership.status });
    }

    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (lastModule?.order || 0) + 1;

    const newModule = await prisma.module.create({
      data: {
        courseId,
        title,
        order,
      },
    });

    return NextResponse.json(newModule);
  } catch (error) {
    console.error('Create module error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
