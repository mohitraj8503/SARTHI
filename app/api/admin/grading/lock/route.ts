export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, isGrading } = await req.json();

    if (!submissionId || isGrading === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Lock or unlock submission
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        isBeingGraded: isGrading,
        lockedById: isGrading ? user.id : null,
        lockedAt: isGrading ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Failed to lock/unlock submission:', error);
    return NextResponse.json({ error: 'Failed to update lock status' }, { status: 500 });
  }
}

