export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { withResiliency } from '@/lib/resilient-db';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

  const result = await withResiliency(async () => {
    return await prisma.note.findMany({
      where: {
        userId: user.id,
        courseId: courseId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }, `user-notes-${user.id}-${courseId}`);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { courseId, lessonId, content, timestamp } = await req.json();

    if (!courseId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        courseId,
        lessonId,
        content,
        timestamp: timestamp ? Math.floor(timestamp) : null,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Save note error:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Note ID required' }, { status: 400 });

  try {
    await prisma.note.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

