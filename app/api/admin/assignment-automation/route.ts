import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  runDailyAssignmentAutomation,
  preValidateDailyAssignments,
  retryFailedAutomationEmails,
  getTodayKolkataISO,
} from '@/lib/assignments/automation-engine';
import { getAvailableActionDates, getDailyInternActionsForDate } from '@/lib/assignments/excel-source';

export async function GET(req: NextRequest) {
  try {
    const todayISO = getTodayKolkataISO();
    const availableDates = getAvailableActionDates();

    // Fetch recent automation runs
    const recentRuns = await prisma.assignmentAutomationRun.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Run pre-validation for upcoming 5 dates
    const upcomingValidations = await Promise.all(
      availableDates
        .filter((d) => d >= todayISO)
        .slice(0, 5)
        .map((d) => preValidateDailyAssignments(d))
    );

    return NextResponse.json({
      success: true,
      todayISO,
      availableDates,
      recentRuns,
      upcomingValidations,
    });
  } catch (error: any) {
    console.error('[API/Admin/AssignmentAutomation] GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch automation stats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'run';
    const targetDate = body.date || getTodayKolkataISO();

    if (action === 'validate') {
      const valResult = await preValidateDailyAssignments(targetDate);
      return NextResponse.json({ success: true, action: 'validate', ...valResult });
    }

    if (action === 'retry') {
      const retryResult = await retryFailedAutomationEmails(targetDate);
      return NextResponse.json({ success: true, action: 'retry', dateISO: targetDate, ...retryResult });
    }

    if (action === 'run') {
      const runResult = await runDailyAssignmentAutomation({
        dateISO: targetDate,
        forceRun: true,
        triggeredBy: 'ADMIN_MANUAL_TRIGGER',
      });
      return NextResponse.json({ success: true, action: 'run', ...runResult });
    }

    return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
  } catch (error: any) {
    console.error('[API/Admin/AssignmentAutomation] POST Error:', error);
    return NextResponse.json({ error: error.message || 'Action execution failed' }, { status: 500 });
  }
}
