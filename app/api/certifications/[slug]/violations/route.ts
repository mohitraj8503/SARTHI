export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { type, details, timestamp, violationCount } = body;

    await prisma.securityEvent.create({
      data: {
        userId:      user.id,
        type:        `EXAM_VIOLATION_${type}`,
        description: `${details} (Count: ${violationCount}) - Exam ID: ${id}`,
        metadata:    JSON.stringify({ examId: id, timestamp, violationCount, type }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EXAM_VIOLATION]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
