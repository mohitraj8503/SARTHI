import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ status: "NONE" });
    }

    const submission = await prisma.creatorInductionSubmission.findFirst({
      where: { userId: session.userId },
      orderBy: { appliedAt: 'desc' },
      select: { status: true }
    });

    if (!submission) {
      return NextResponse.json({ status: "NONE" });
    }

    return NextResponse.json({ status: submission.status });
  } catch (error) {
    console.error('INDUCTION_STATUS_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
