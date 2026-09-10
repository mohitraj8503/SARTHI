export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: questionId } = await params;
    const { answer } = await req.json();

    if (!answer) {
      return NextResponse.json({ error: 'Answer content is required' }, { status: 400 });
    }

    const newAnswer = await prisma.answer.create({
      data: {
        questionId,
        userId: user.id,
        answer
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    return NextResponse.json(newAnswer);
  } catch (error) {
    console.error('Create answer error:', error);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
}
