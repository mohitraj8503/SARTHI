import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ status: 'NONE' });
    }

    const latestSubmission = await prisma.builderInductionSubmission.findFirst({
      where: { userId: session.userId },
      orderBy: { appliedAt: 'desc' },
      select: { status: true, isIndustrySelected: true }
    });

    return NextResponse.json({ 
      status: latestSubmission?.status || 'NONE',
      isIndustrySelected: latestSubmission?.isIndustrySelected || false
    });
  } catch (error) {
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
