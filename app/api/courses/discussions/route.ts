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
  const lessonId = searchParams.get('lessonId');

  if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

  const result = await withResiliency(async () => {
    return await prisma.question.findMany({
      where: {
        courseId,
        ...(lessonId && { lessonId })
      },
      include: {
        user: {
          select: { name: true, image: true }
        },
        answers: {
          include: {
            user: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { answers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }, `discussions-${courseId}-${lessonId || 'all'}`);

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { courseId, lessonId, title, content } = await req.json();

    if (!courseId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        userId: user.id,
        courseId,
        lessonId,
        title,
        content
      },
      include: {
        user: {
          select: { name: true, image: true }
        },
        _count: {
          select: { answers: true }
        }
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

