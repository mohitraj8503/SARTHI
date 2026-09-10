import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
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

    // Resolve date in Asia/Kolkata
    const now = new Date();
    const kolkataTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const year = kolkataTime.getFullYear();
    const month = kolkataTime.getMonth();
    const day = kolkataTime.getDate();
    const startOfDayKolkata = new Date(Date.UTC(year, month, day));

    // Fetch active interns
    const activeInterns = await prisma.batchMember.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true }
    });

    // Fetch assignments for today
    const todayAssignments = await prisma.internshipAssignment.findMany({
      where: {
        category: 'Daily Assignment',
        scheduledDate: startOfDayKolkata
      },
      include: {
        recipients: true
      }
    });

    // Check which interns are missing today's task
    const missingInterns: any[] = [];
    for (const intern of activeInterns) {
      const hasTask = todayAssignments.some(ass => ass.memberId === intern.id);
      if (!hasTask) {
        missingInterns.push({
          id: intern.id,
          name: intern.user?.name,
          email: intern.user?.email,
          permanentInternId: intern.permanentInternId
        });
      }
    }

    // Count emails sent in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const emailsSent24h = await prisma.emailLog.count({
      where: {
        sentAt: { gte: oneDayAgo }
      }
    });

    // Fetch last 10 email logs
    const recentEmailLogs = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      diagnosticsTimeUTC: now.toISOString(),
      diagnosticsTimeKolkata: kolkataTime.toISOString(),
      timezone: 'Asia/Kolkata',
      todayTargetDate: startOfDayKolkata.toISOString().split('T')[0],
      stats: {
        totalActiveInterns: activeInterns.length,
        todayAssignmentsCount: todayAssignments.length,
        missingTodayAssignmentsCount: missingInterns.length,
        emailsSentLast24hCount: emailsSent24h
      },
      missingInternsForToday: missingInterns,
      recentEmailLogs: recentEmailLogs.map(log => ({
        id: log.id,
        recipient: log.recipient,
        subject: log.subject,
        status: log.status,
        sentAt: log.sentAt.toISOString(),
        error: log.error
      })),
      endpoints: {
        triggerDailyCron: '/api/cron/daily-tasks'
      }
    });
  } catch (error: any) {
    console.error('Diagnostics route error:', error);
    return NextResponse.json({ error: 'Failed to retrieve diagnostics data', details: error.message }, { status: 500 });
  }
}
