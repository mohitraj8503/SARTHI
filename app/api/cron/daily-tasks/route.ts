import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getBrandedTemplate } from '@/lib/email/templates/branded';

function getKolkataDateInfo(date: Date) {
  // Asia/Kolkata is UTC+5:30
  const kolkataOffset = 5.5 * 60 * 60 * 1000;
  const kolkataTime = new Date(date.getTime() + kolkataOffset);
  
  const startOfDayUTC = new Date(Date.UTC(
    kolkataTime.getUTCFullYear(),
    kolkataTime.getUTCMonth(),
    kolkataTime.getUTCDate()
  ));
  
  const formattedDate = kolkataTime.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });

  return { startOfDayUTC, formattedDate };
}

function isAuthorizedCron(req: NextRequest): boolean {
  const secretHeader = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('authorization');
  const urlSecret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET || 'tt_cron_secret_dfb9c6dae88a308855f8656a621c8c9f';

  if (secretHeader === expectedSecret || urlSecret === expectedSecret) {
    return true;
  }
  if (authHeader === `Bearer ${expectedSecret}`) {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    const { runDailyAssignmentAutomation } = await import('@/lib/assignments/automation-engine');
    const targetDateISO = req.nextUrl.searchParams.get('date') || undefined;
    const result = await runDailyAssignmentAutomation({
      dateISO: targetDateISO,
      triggeredBy: 'CRON_DAILY_TASKS_ENDPOINT',
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Cron/DailyTasks] Error:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    const { runDailyAssignmentAutomation } = await import('@/lib/assignments/automation-engine');
    const body = await req.json().catch(() => ({}));
    const targetDateISO = body.date || req.nextUrl.searchParams.get('date') || undefined;
    const result = await runDailyAssignmentAutomation({
      dateISO: targetDateISO,
      triggeredBy: 'CRON_DAILY_TASKS_POST_ENDPOINT',
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Cron/DailyTasks] Error:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failed' }, { status: 500 });
  }
}

async function processDailyTaskEmails() {
  const { startOfDayUTC, formattedDate } = getKolkataDateInfo(new Date());

  // Load active interns
  const activeMembers = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: true
    }
  });

  const attempted: any[] = [];
  const sent: any[] = [];
  const skipped: any[] = [];
  const failed: any[] = [];

  for (const member of activeMembers) {
    if (!member.user || !member.user.email) {
      continue;
    }

    // Fetch exactly one assignment for that intern for today's date
    const assignment = await prisma.internshipAssignment.findFirst({
      where: {
        memberId: member.id,
        scheduledDate: startOfDayUTC
      }
    });

    if (!assignment) {
      skipped.push({
        intern: member.user.name,
        email: member.user.email,
        reason: 'No assignment scheduled for today'
      });
      continue;
    }

    attempted.push({
      internId: member.id,
      assignmentId: assignment.id,
      recipient: member.user.email
    });

    // Check if successful DAILY_TASK email log already exists to prevent duplicate emails
    const alreadySent = await prisma.emailLog.findFirst({
      where: {
        userId: member.userId,
        type: 'DAILY_TASK',
        subject: { contains: `Day ${assignment.dayNumber}` },
        status: 'sent'
      }
    });

    if (alreadySent) {
      skipped.push({
        intern: member.user.name,
        email: member.user.email,
        assignmentId: assignment.id,
        reason: 'Email already sent successfully for this task today'
      });
      continue;
    }

    // Generate daily task email HTML
    const emailHtml = buildDailyTaskEmailHtml({
      internName: member.user.name || 'Intern',
      dayNumber: assignment.dayNumber || 0,
      dateStr: formattedDate,
      designation: assignment.designation || 'Marketing Intern',
      campaign: assignment.campaign || 'General',
      taskTitle: assignment.title,
      exactAction: assignment.description,
      assetDeliverable: assignment.assetDeliverable || 'N/A',
      channel: assignment.channel || 'N/A',
      kpi: assignment.kpi || 'N/A',
      submissionEvidence: assignment.submissionEvidence || 'N/A',
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app'}/dashboard/internship`
    });

    // Send email
    try {
      const emailResult = await sendTransactionalEmail({
        to: member.user.email,
        subject: `🎯 Day ${assignment.dayNumber} Task: ${assignment.title} | SARTHI`,
        html: emailHtml,
        type: 'notification',
        userId: member.userId,
      });

      if (emailResult.success) {
        // Log the successful send under type DAILY_TASK
        await prisma.emailLog.updateMany({
          where: { messageId: emailResult.messageId },
          data: { type: 'DAILY_TASK' } // ensure the type is marked DAILY_TASK for idempotency check
        });

        sent.push({
          intern: member.user.name,
          email: member.user.email,
          assignmentId: assignment.id,
          messageId: emailResult.messageId
        });
      } else {
        failed.push({
          intern: member.user.name,
          email: member.user.email,
          assignmentId: assignment.id,
          error: emailResult.error
        });
      }
    } catch (err: any) {
      failed.push({
        intern: member.user.name,
        email: member.user.email,
        assignmentId: assignment.id,
        error: err.message
      });
    }
  }

  return {
    scheduled_for: startOfDayUTC.toISOString(),
    attemptedCount: attempted.length,
    sentCount: sent.length,
    skippedCount: skipped.length,
    failedCount: failed.length,
    sentDetails: sent,
    skippedDetails: skipped,
    failedDetails: failed
  };
}

interface DailyTaskEmailOptions {
  internName: string;
  dayNumber: number;
  dateStr: string;
  designation: string;
  campaign: string;
  taskTitle: string;
  exactAction: string;
  assetDeliverable: string;
  channel: string;
  kpi: string;
  submissionEvidence: string;
  dashboardUrl: string;
}

function buildDailyTaskEmailHtml(opts: DailyTaskEmailOptions): string {
  const {
    internName,
    dayNumber,
    dateStr,
    designation,
    campaign,
    taskTitle,
    exactAction,
    assetDeliverable,
    channel,
    kpi,
    submissionEvidence,
    dashboardUrl
  } = opts;

  const emailBody = `
<p style="margin:0 0 20px;font-size:16px;color:#1f2937;font-weight:700;">Good morning, ${internName} 👋</p>

<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
  Here is your personalized execution task for today. Review the target parameters and promote correctly.
</p>

<!-- CAMPAIGN CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:20px;margin-bottom:24px;">
  <tr>
    <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid #E2E8F0;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1px;">DAY ${dayNumber} — ${campaign}</span>
      <h2 style="margin:4px 0 0;font-size:18px;font-weight:800;color:#0F172A;">${taskTitle}</h2>
    </td>
  </tr>
  <tr>
    <td style="padding-top:14px;width:50%;">
      <span style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">Role / Designation:</span>
      <div style="font-size:13px;font-weight:700;color:#0F172A;margin-top:2px;">${designation}</div>
    </td>
    <td style="padding-top:14px;width:50%;">
      <span style="font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;">Scheduled Date:</span>
      <div style="font-size:13px;font-weight:700;color:#0F172A;margin-top:2px;">${dateStr}</div>
    </td>
  </tr>
</table>

<!-- ACTIONS & GUIDELINES -->
<div style="margin-bottom:24px;">
  <p style="font-size:12px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">What You Need to Do</p>
  <div style="background:#FFFFFF;border-left:4px solid #3B82F6;padding:12px 16px;border-radius:4px;font-size:14px;color:#334155;line-height:1.6;">
    ${exactAction.replace(/\n/g, '<br />')}
  </div>
</div>

<!-- PARAMETERS -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;color:#334155;line-height:1.5;">
  <tr>
    <td style="padding-bottom:10px;font-weight:700;width:30%;">Deliverable:</td>
    <td style="padding-bottom:10px;">${assetDeliverable}</td>
  </tr>
  <tr>
    <td style="padding-bottom:10px;font-weight:700;">Channel:</td>
    <td style="padding-bottom:10px;">${channel}</td>
  </tr>
  <tr>
    <td style="padding-bottom:10px;font-weight:700;">Success Measure (KPI):</td>
    <td style="padding-bottom:10px;">${kpi}</td>
  </tr>
  <tr>
    <td style="font-weight:700;">Evidence Required:</td>
    <td>${submissionEvidence}</td>
  </tr>
</table>

<p style="margin:0 0 20px;font-size:14px;color:#475569;">
  Please submit your proof of completion directly through your dashboard once completed.
</p>
`;

  return getBrandedTemplate({
    badge: `DAY ${dayNumber} INTERN TASK`,
    heading: taskTitle,
    body: emailBody,
    action: {
      label: 'Open Intern Dashboard',
      url: dashboardUrl,
    },
    senderName: 'SARTHI Intern Team',
  });
}
