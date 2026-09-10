export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ message: 'Lesson ID required' }, { status: 400 });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

