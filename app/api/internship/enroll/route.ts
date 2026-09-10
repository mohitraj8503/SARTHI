import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batchId } = await req.json();
    if (!batchId) {
      return NextResponse.json({ error: 'Missing batchId' }, { status: 400 });
    }

    // Check if batch exists
    const batch = await prisma.internshipBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check if already enrolled in this batch
    let member = await prisma.batchMember.findUnique({
      where: {
        userId_batchId: {
          userId: user.id,
          batchId,
        },
      },
    });

    if (!member) {
      let created = false;
      let attempts = 0;
      while (!created && attempts < 5) {
        attempts++;
        const count = await prisma.batchMember.count();
        const sequenceNum = count + attempts;
        const padNum = String(sequenceNum).padStart(4, '0');
        const padInternId = String(sequenceNum).padStart(6, '0');
        const year = new Date().getFullYear();
        const referenceNumber = attempts === 1 ? `TT-INT-${year}-${padNum}` : `TT-INT-${year}-${padNum}-${Date.now().toString().slice(-4)}`;
        const permanentInternId = attempts === 1 ? `TTI${padInternId}` : `TTI${padInternId}${Date.now().toString().slice(-3)}`;

        try {
          member = await prisma.batchMember.create({
            data: {
              userId: user.id,
              batchId,
              status: 'ACTIVE',
              referenceNumber,
              permanentInternId,
            },
          });
          created = true;
        } catch (err: any) {
          if (err.code === 'P2002' && attempts < 5) {
            continue;
          }
          throw err;
        }
      }

      // Create attendance row
      await prisma.internshipAttendance.create({
        data: {
          memberId: member.id,
          daysActive: 0,
          totalSubmitted: 0,
          consistency: 0,
          streak: 0,
        },
      });
    }

    return NextResponse.json({ success: true, memberId: member.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Enrollment failed' }, { status: 500 });
  }
}
