import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (user.role as string)?.toUpperCase() || '';
    const isAuthorized = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const fieldFilter = searchParams.get('field');

    // Fetch active batch members with user and application info
    const members = await prisma.batchMember.findMany({
      where: { status: 'ACTIVE' },
      include: {
        batch: {
          select: { id: true, name: true, mentorEmail: true }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            internshipApplications: {
              select: { domain: true },
              orderBy: { submittedAt: 'desc' },
              take: 1,
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedInterns = members.map(m => {
      const appDomain = m.user?.internshipApplications?.[0]?.domain;
      const domain = appDomain && appDomain.trim().length > 0 ? appDomain.trim() : 'Software Development';
      return {
        id: m.id,
        userId: m.userId,
        batchId: m.batchId,
        batchName: m.batch?.name || '',
        name: m.user?.name || 'Unknown Intern',
        email: m.user?.email || '',
        domain: domain,
      };
    });

    // Extract unique fields/domains
    const allFields = Array.from(new Set(formattedInterns.map(i => i.domain))).filter(Boolean).sort();

    // Filter if requested
    let filtered = formattedInterns;
    if (fieldFilter && fieldFilter !== 'ALL') {
      filtered = formattedInterns.filter(i => i.domain.toLowerCase() === fieldFilter.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      interns: filtered,
      allFields: allFields,
      totalCount: formattedInterns.length,
    });
  } catch (error: any) {
    console.error('[API/Mentor/Interns] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch interns' }, { status: 500 });
  }
}
