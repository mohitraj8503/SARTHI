export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { lessons } = await req.json(); // Array of { id: string, orderNumber: number, moduleId?: string }

    if (!lessons || !Array.isArray(lessons)) {
      return NextResponse.json({ message: 'Missing lessons array' }, { status: 400 });
    }

    // Update in transaction
    await prisma.$transaction(
      lessons.map((lesson: any) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { 
            orderNumber: lesson.orderNumber,
            moduleId: lesson.moduleId !== undefined ? lesson.moduleId : undefined
          },
        })
      )
    );

    return NextResponse.json({ success: true, message: 'Reordered successfully' });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
