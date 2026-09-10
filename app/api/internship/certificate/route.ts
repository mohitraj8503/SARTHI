import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId } = await req.json();
    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    // 1. Get member details
    const member = await prisma.batchMember.findUnique({
      where: { id: memberId },
      include: {
        batch: {
          include: { assignments: true },
        },
        submissions: {
          where: { status: 'Approved' },
        },
        attendances: true,
        certificates: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const attendanceRecord = member.attendances?.[0] || { consistency: 0 };
    const completedCount = member.submissions.length;
    const totalCount = member.batch.assignments.length || 1;

    // 2. Validate Eligibility criteria
    const hasConsistency = attendanceRecord.consistency >= 80;
    const hasAssignments = (completedCount / totalCount) >= 0.9;
    const hasXp = member.currentXp >= 2000;

    if (!hasConsistency || !hasAssignments || !hasXp) {
      return NextResponse.json({ 
        error: 'Eligibility criteria not met.',
        details: { hasConsistency, hasAssignments, hasXp }
      }, { status: 400 });
    }

    // 3. Find or generate certificate
    let certificate = member.certificates?.[0];
    if (!certificate) {
      certificate = await prisma.internshipCertificate.create({
        data: {
          memberId,
          certUrl: `/verify/internship/${memberId}`,
          lorUrl: `/verify/lor/${memberId}`,
          reportUrl: `/verify/report/${memberId}`,
        },
      });
    }

    return NextResponse.json(certificate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
