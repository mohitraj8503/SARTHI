export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function ensureModuleOwnership(moduleId: string, userId: string) {
  const existingModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      course: {
        select: { instructorId: true }
      }
    },
  });

  if (!existingModule) {
    return { valid: false, status: 404, message: 'Module not found' };
  }

  if (existingModule.course.instructorId !== userId) {
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

    const { moduleId, title, description, order, isLocked } = await req.json();

    if (!moduleId) {
      return NextResponse.json({ message: 'Missing moduleId' }, { status: 400 });
    }

    const ownership = await ensureModuleOwnership(moduleId, user.id);
    if (!ownership.valid) {
      return NextResponse.json({ error: ownership.message }, { status: ownership.status });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = Number(order);
    if (isLocked !== undefined) updateData.isLocked = Boolean(isLocked);

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: updateData,
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Update module error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
