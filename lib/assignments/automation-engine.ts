import { prisma } from '@/lib/prisma';
import { getDailyInternActionsForDate, DailyActionRow } from './excel-source';
import { sendTransactionalEmail } from '@/lib/email/send';

export interface AutomationRunOptions {
  dateISO?: string; // YYYY-MM-DD in Asia/Kolkata
  forceRun?: boolean;
  triggeredBy?: string;
}

export interface AutomationResult {
  runId: string;
  dateISO: string;
  status: string; // COMPLETED, FAILED, NO_ROWS
  expectedCount: number;
  createdCount: number;
  emailSentCount: number;
  failedCount: number;
  skippedDuplicateCount: number;
  errorDetails?: string;
  items: Array<{
    internId: string;
    internName: string;
    assignmentId?: string;
    createdStatus: string;
    emailStatus: string;
    error?: string;
  }>;
}

/**
 * Returns current date in Asia/Kolkata as YYYY-MM-DD.
 */
export function getTodayKolkataISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

/**
 * Builds unique, deterministic idempotency key for an assignment.
 */
export function buildAssignmentIdempotencyKey(
  dateISO: string,
  internId: string,
  day: number,
  campaign: string
): string {
  const sanitizedCampaign = campaign.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `ASSIGNMENT:${dateISO}:${internId}:${day}:${sanitizedCampaign}`;
}

import { getAssignmentEmailHtml } from '@/lib/email/templates/assignment-email';

/**
 * Builds formatted description guidelines for assignment.
 * Automatically injects Markly project repository (https://github.com/mohitraj8503/Markly)
 * for Software Development, Web Development, and Digital Marketing interns.
 */
export function buildAssignmentDescription(row: DailyActionRow): string {
  let actionText = row.exactAction || '';
  const desigLower = (row.designation || '').toLowerCase();

  // Inject Markly repository link for Software & Web developers if not already present
  if (desigLower.includes('software') || desigLower.includes('web')) {
    if (!actionText.includes('github.com/mohitraj8503/Markly')) {
      actionText += `\n\n📌 Primary Repository (Markly): https://github.com/mohitraj8503/Markly\nDevelop, test, and commit features/automation modules directly into Markly.`;
    }
  }

  // Inject Markly campaign link for Digital Marketing & Social Media interns
  if (desigLower.includes('digital marketing') || desigLower.includes('social media')) {
    if (!actionText.includes('github.com/mohitraj8503/Markly')) {
      actionText += `\n\n📌 Campaign Subject (Markly): https://github.com/mohitraj8503/Markly\nPromote Markly platform capabilities, features, and user benefits across channels.`;
    }
  }

  return `OBJECTIVE
${row.whatToPromote || row.campaign}

EXACT ACTION
${actionText}

DELIVERABLE
${row.assetDeliverable}

CHANNEL
${row.channel}

CTA
${row.cta}

KPI
${row.kpi}

SUBMISSION EVIDENCE
${row.submissionEvidence}`;
}

/**
 * Builds clean transactional email HTML for intern assignment notification using branded.ts template.
 * Complies with Rule 6 (Clean HTML, no raw markdown headers/symbols) and branded template requirements.
 */
export function buildAssignmentEmailHtml(params: {
  internName: string;
  day: number;
  dateISO: string;
  campaign: string;
  title: string;
  exactAction: string;
  assetDeliverable: string;
  kpi: string;
  submissionEvidence: string;
  dashboardUrl: string;
}): string {
  const {
    internName,
    day,
    dateISO,
    campaign,
    title,
    exactAction,
    assetDeliverable,
    kpi,
    submissionEvidence,
    dashboardUrl,
  } = params;

  const descriptionBody = `OBJECTIVE
${campaign}

EXACT ACTION
${exactAction}

DELIVERABLE
${assetDeliverable}

KPI
${kpi}

SUBMISSION EVIDENCE
${submissionEvidence}`;

  return getAssignmentEmailHtml({
    recipientName: internName,
    assignmentTitle: `Day ${day} — ${title}`,
    category: campaign || 'Daily Assignment',
    difficulty: 'Intermediate',
    xpReward: 100,
    description: descriptionBody,
    deadlineFormatted: `${dateISO} 11:59 PM (IST)`,
    dashboardUrl,
  });
}

/**
 * Resolves or provisions a BatchMember for a given spreadsheet intern ID.
 */
export async function resolveOrProvisionBatchMember(
  internId: string,
  internName: string,
  designation: string
): Promise<any> {
  // 1. Try finding BatchMember by exact permanentInternId
  let member = await prisma.batchMember.findFirst({
    where: { permanentInternId: internId },
    include: { user: true, batch: true },
  });

  if (member) {
    return member;
  }

  // 2. Lookup known roster email/name mappings
  const knownRoster: Record<string, { email: string; name: string }> = {
    TTI000001: { email: 'ranjansingh.w@gmail.com', name: 'Ranjan Singh' },
    TTI000002: { email: 'ps859521@gmail.com', name: 'Pranshu Kumar Singh' },
    TTI000003: { email: 'arpitjha1647@gmail.com', name: 'Arpit Jha' },
    TTI000006: { email: 'keshavruhela25@gmail.com', name: 'Keshav Ruhela' },
    TTI000009: { email: 'aniketdutta615@gmail.com', name: 'Aniket Dutta' },
    TTI000012: { email: 'kumaritejal535@gmail.com', name: 'Kumari Tejal' },
    TTI000016: { email: 'nandinikatiyar5@gmail.com', name: 'Nandini Katiyar' },
    TTI000017: { email: 'nairjaanvi199@gmail.com', name: 'Jaanvi Nair' },
    TTI000018: { email: 'surjobanerjee207@gmail.com', name: 'Surjo Banerjee' },
    TTI000019: { email: 'kumarkeshav10320@gmail.com', name: 'Keshav Kumar' },
    TTI000019454: { email: 'harshnayan018@gmail.com', name: 'Harsh Nayan' },
    TTI000025: { email: 'viveksharma.tt@gmail.com', name: 'Vivek Sharma' },
    TTI000026: { email: 'nairjaanvi199@gmail.com', name: 'Jaanvi Nair' },
    TTI000038: { email: 'nandinikatiyar5@gmail.com', name: 'Nandini Katiyar' },
    TTI000051: { email: 'ps859521@gmail.com', name: 'Pranshu Kumar Singh' },
    TTI000052: { email: 'ayushsingh.tt@gmail.com', name: 'Ayush Singh' },
    TTI000054: { email: 'harshpathak.tt@gmail.com', name: 'Harsh Pathak' },
    TTI000055: { email: 'kritikamohanty.tt@gmail.com', name: 'Kritika Mohanty' },
    TTI000056: { email: 'harshitakumari.tt@gmail.com', name: 'Harshita Kumari Singh' },
    TTI000058: { email: 'nitinsinha062@gmail.com', name: 'Nitin Sinha' },
    TTI000059: { email: 'abhinavprakash.tt@gmail.com', name: 'Abhinav Prakash' },
    TTI000060: { email: 'surjobanerjee207@gmail.com', name: 'Surjo Banerjee' },
    TTI000062: { email: 'kumarkeshav10320@gmail.com', name: 'Keshav Kumar' },
    TTI000066: { email: 'keshavruhela25@gmail.com', name: 'Keshav Ruhela' },
    TTI000083: { email: 'kumaritejal535@gmail.com', name: 'Kumari Tejal' },
    TTI000086: { email: 'aniketdutta615@gmail.com', name: 'Aniket Dutta' },
    TTI000128: { email: 'nitinsinha062@gmail.com', name: 'Nitin Sinha' },
    TTI000150: { email: 'harshnayan018@gmail.com', name: 'Harsh Nayan' },
  };

  const rosterInfo = knownRoster[internId];
  const targetEmail = rosterInfo ? rosterInfo.email : `${internId.toLowerCase()}@sarthi-woad.vercel.app`;
  const targetName = rosterInfo ? rosterInfo.name : internName;

  // Find User by email or name
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: targetEmail },
        { name: { contains: targetName.split(' ')[0] } }
      ]
    }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: targetEmail,
        name: targetName,
        role: 'STUDENT',
        hasInternshipBadge: true,
        currentCourse: designation,
      }
    });
  }

  // Find active internship batch or create
  let batch = await prisma.internshipBatch.findFirst({
    where: { name: { contains: 'July 2026' } }
  });

  if (!batch) {
    let internship = await prisma.internship.findFirst();
    if (!internship) {
      internship = await prisma.internship.create({
        data: {
          title: "SARTHI Creator & Developer Internship",
          description: "Master industry software development, marketing campaigns, and creator workflows.",
        }
      });
    }
    batch = await prisma.internshipBatch.create({
      data: {
        internshipId: internship.id,
        name: "July 2026 Batch",
        mentorName: "Mukul Pandey",
        mentorEmail: "pm.enthuse@gmail.com"
      }
    });
  }

  // Create BatchMember record for user with permanentInternId
  member = await prisma.batchMember.upsert({
    where: {
      userId_batchId: {
        userId: user.id,
        batchId: batch.id
      }
    },
    update: {
      permanentInternId: internId,
      status: 'ACTIVE'
    },
    create: {
      userId: user.id,
      batchId: batch.id,
      permanentInternId: internId,
      status: 'ACTIVE'
    },
    include: { user: true, batch: true }
  });

  return member;
}

/**
 * Validates upcoming spreadsheet rows and intern mappings before release time.
 */
export async function preValidateDailyAssignments(dateISO: string) {
  const rows = getDailyInternActionsForDate(dateISO);
  const results = {
    dateISO,
    rowCount: rows.length,
    validRows: 0,
    invalidRows: 0,
    errors: [] as string[],
    internsResolved: [] as string[],
  };

  if (rows.length === 0) {
    results.errors.push(`No spreadsheet rows found for date ${dateISO}`);
    return results;
  }

  for (const row of rows) {
    let hasError = false;

    if (!row.internId || !row.internName) {
      results.errors.push(`Row Day ${row.day}: Missing intern ID or name`);
      hasError = true;
    }

    if (!row.campaign || !row.exactAction || !row.assetDeliverable) {
      results.errors.push(`Row Day ${row.day} (${row.internName}): Missing campaign/action/deliverable details`);
      hasError = true;
    }

    try {
      const member = await resolveOrProvisionBatchMember(row.internId, row.internName, row.designation);
      if (!member || !member.user || !member.user.email) {
        results.errors.push(`Row Day ${row.day} (${row.internName}): Could not resolve active email`);
        hasError = true;
      } else {
        results.internsResolved.push(`${row.internId} -> ${member.user.name} (${member.user.email})`);
      }
    } catch (err: any) {
      results.errors.push(`Row Day ${row.day} (${row.internName}): Error resolving intern - ${err.message}`);
      hasError = true;
    }

    if (hasError) {
      results.invalidRows++;
    } else {
      results.validRows++;
    }
  }

  return results;
}

/**
 * Retries sending emails for assignments created by daily automation that failed email delivery.
 */
export async function retryFailedAutomationEmails(dateISO?: string): Promise<{
  attempted: number;
  reSent: number;
  failed: number;
}> {
  const targetDate = dateISO || getTodayKolkataISO();
  const failedItems = await prisma.assignmentAutomationItem.findMany({
    where: {
      sourceDate: targetDate,
      emailStatus: { in: ['EMAIL_FAILED', 'EMAIL_PENDING'] },
      assignmentId: { not: null },
    },
    include: {
      run: true,
    },
  });

  let reSent = 0;
  let failed = 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
  const dashboardUrl = `${appUrl}/dashboard/internship`;

  for (const item of failedItems) {
    if (!item.assignmentId) continue;

    const assignment = await prisma.internshipAssignment.findUnique({
      where: { id: item.assignmentId },
      include: {
        recipients: {
          include: {
            member: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!assignment || assignment.recipients.length === 0) continue;
    const recipient = assignment.recipients[0];
    const member = recipient.member;

    if (!member.user || !member.user.email) continue;

    const emailHtml = buildAssignmentEmailHtml({
      internName: member.user.name || 'Intern',
      day: assignment.dayNumber || 0,
      dateISO: targetDate,
      campaign: assignment.campaign || 'Daily Assignment',
      title: assignment.title,
      exactAction: assignment.description,
      assetDeliverable: assignment.assetDeliverable || 'N/A',
      kpi: assignment.kpi || 'N/A',
      submissionEvidence: assignment.submissionEvidence || 'N/A',
      dashboardUrl,
    });

    try {
      const emailResult = await sendTransactionalEmail({
        to: member.user.email,
        subject: `New Assignment — Day ${assignment.dayNumber}: ${assignment.title}`,
        html: emailHtml,
        type: 'notification',
        provider: 'resend',
      });

      if (emailResult.success) {
        await prisma.assignmentAutomationItem.update({
          where: { id: item.id },
          data: {
            emailStatus: 'EMAIL_SENT',
            lastError: null,
          },
        });
        reSent++;
      } else {
        await prisma.assignmentAutomationItem.update({
          where: { id: item.id },
          data: {
            emailStatus: 'EMAIL_FAILED',
            lastError: String(emailResult.error || 'Retry delivery failed'),
          },
        });
        failed++;
      }
    } catch (err: any) {
      await prisma.assignmentAutomationItem.update({
        where: { id: item.id },
        data: {
          emailStatus: 'EMAIL_FAILED',
          lastError: err.message,
        },
      });
      failed++;
    }
  }

  return { attempted: failedItems.length, reSent, failed };
}

/**
 * Main backend function to execute daily assignment automation at 10:00 AM IST.
 */
export async function runDailyAssignmentAutomation(
  options: AutomationRunOptions = {}
): Promise<AutomationResult> {
  const targetDateISO = options.dateISO || getTodayKolkataISO();
  const runId = `RUN_${targetDateISO}_${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
  const dashboardUrl = `${appUrl}/dashboard/internship`;

  console.log(`🚀 [AssignmentAutomation] Starting run ${runId} for Asia/Kolkata date: ${targetDateISO}...`);

  // Load today's spreadsheet rows
  const rows = getDailyInternActionsForDate(targetDateISO);
  if (rows.length === 0) {
    console.warn(`⚠️ [AssignmentAutomation] No spreadsheet rows found for ${targetDateISO}`);
    return {
      runId,
      dateISO: targetDateISO,
      status: 'NO_ROWS',
      expectedCount: 0,
      createdCount: 0,
      emailSentCount: 0,
      failedCount: 0,
      skippedDuplicateCount: 0,
      errorDetails: `No spreadsheet rows scheduled in Daily Intern Actions for ${targetDateISO}`,
      items: [],
    };
  }

  // Target date release / deadline timestamp calculations in UTC for Asia/Kolkata
  // 10:00 AM IST = 04:30 UTC
  // 11:59 PM IST = 18:29 UTC
  const [yearStr, monthStr, dayStr] = targetDateISO.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const dayDate = parseInt(dayStr, 10);

  const releaseAt = new Date(Date.UTC(year, month - 1, dayDate, 4, 30, 0));
  const deadline = new Date(Date.UTC(year, month - 1, dayDate, 18, 29, 59));
  const startOfDayUTC = new Date(Date.UTC(year, month - 1, dayDate, 0, 0, 0));

  // Initialize Automation Run DB record
  const automationRun = await prisma.assignmentAutomationRun.create({
    data: {
      runId,
      date: targetDateISO,
      timezone: 'Asia/Kolkata',
      scheduledTime: releaseAt,
      actualStartTime: new Date(),
      sourceSheet: 'Daily Intern Actions',
      sourceDay: rows[0].day,
      expectedCount: rows.length,
      status: 'PROCESSING',
    },
  });

  let createdCount = 0;
  let emailSentCount = 0;
  let failedCount = 0;
  let skippedDuplicateCount = 0;

  const resultItems: AutomationResult['items'] = [];

  for (const row of rows) {
    const idempotencyKey = buildAssignmentIdempotencyKey(
      targetDateISO,
      row.internId,
      row.day,
      row.campaign
    );

    try {
      // Check if assignment with idempotencyKey already exists
      const existingAssignment = await prisma.internshipAssignment.findUnique({
        where: { idempotencyKey },
        include: {
          recipients: {
            include: { member: { include: { user: true } } },
          },
        },
      });

      if (existingAssignment) {
        console.log(`ℹ️ [AssignmentAutomation] Duplicate detected for ${idempotencyKey}. Skipping assignment creation.`);
        skippedDuplicateCount++;

        // Log item as SKIPPED_DUPLICATE
        await prisma.assignmentAutomationItem.upsert({
          where: { idempotencyKey },
          update: { createdStatus: 'SKIPPED_DUPLICATE' },
          create: {
            runId: automationRun.id,
            assignmentId: existingAssignment.id,
            internId: row.internId,
            memberId: existingAssignment.memberId,
            sourceDay: row.day,
            sourceDate: targetDateISO,
            campaign: row.campaign,
            idempotencyKey,
            createdStatus: 'SKIPPED_DUPLICATE',
            emailStatus: 'SKIPPED',
          },
        });

        resultItems.push({
          internId: row.internId,
          internName: row.internName,
          assignmentId: existingAssignment.id,
          createdStatus: 'SKIPPED_DUPLICATE',
          emailStatus: 'SKIPPED',
        });
        continue;
      }

      // Resolve or provision BatchMember for intern
      const member = await resolveOrProvisionBatchMember(
        row.internId,
        row.internName,
        row.designation
      );

      const title = `Day ${row.day} — ${row.whatToPromote || row.campaign}`;
      const description = buildAssignmentDescription(row);

      // Create InternshipAssignment DB record
      const assignment = await prisma.internshipAssignment.create({
        data: {
          batchId: member.batchId,
          title,
          description,
          category: 'Daily Assignment',
          difficulty: 'Intermediate',
          estimatedTime: '2 Hours',
          xpReward: 100,
          deadline,
          releaseAt,
          status: 'active', // Immediately visible on intern dashboard
          mode: 'INDIVIDUAL',
          dayNumber: row.day,
          scheduledDate: startOfDayUTC,
          week: row.week || null,
          designation: row.designation,
          campaign: row.campaign,
          phase: row.phase,
          assetDeliverable: row.assetDeliverable,
          channel: row.channel,
          cta: row.cta,
          kpi: row.kpi,
          submissionEvidence: row.submissionEvidence,
          memberId: member.id,
          idempotencyKey,
        },
      });

      createdCount++;

      // Link recipient
      await prisma.internshipAssignmentRecipient.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id,
        },
      });

      // Sync submission record in Assigned state
      await prisma.internshipSubmission.upsert({
        where: {
          id: `${assignment.id}_${member.id}`,
        },
        update: { status: 'Assigned' },
        create: {
          memberId: member.id,
          assignmentId: assignment.id,
          status: 'Assigned',
        },
      }).catch(() => {
        // Fallback create if unique ID is cuid
        return prisma.internshipSubmission.create({
          data: {
            memberId: member.id,
            assignmentId: assignment.id,
            status: 'Assigned',
          },
        });
      });

      // Create in-app student notification
      await prisma.notification.create({
        data: {
          userId: member.userId,
          title: `New Assignment Released — Day ${row.day} 📋`,
          body: `Your assignment "${title}" is now active on your dashboard!`,
          message: `Your task for ${targetDateISO}: ${row.exactAction.slice(0, 120)}...`,
          type: 'SYSTEM',
        },
      }).catch((err) => console.error(`[NotificationError] ${err.message}`));

      // Send transactional email
      let emailStatus = 'EMAIL_PENDING';
      let emailError: string | null = null;

      if (member.user && member.user.email) {
        const emailHtml = buildAssignmentEmailHtml({
          internName: member.user.name || row.internName,
          day: row.day,
          dateISO: targetDateISO,
          campaign: row.campaign,
          title,
          exactAction: row.exactAction,
          assetDeliverable: row.assetDeliverable,
          kpi: row.kpi,
          submissionEvidence: row.submissionEvidence,
          dashboardUrl,
        });

        try {
          const emailRes = await sendTransactionalEmail({
            to: member.user.email,
            subject: `New Assignment — Day ${row.day}: ${title}`,
            html: emailHtml,
            type: 'notification',
            provider: 'resend',
          });

          if (emailRes.success) {
            emailStatus = 'EMAIL_SENT';
            emailSentCount++;
          } else {
            emailStatus = 'EMAIL_FAILED';
            emailError = String(emailRes.error || 'Resend API returned failure');
          }
        } catch (err: any) {
          emailStatus = 'EMAIL_FAILED';
          emailError = err.message;
        }
      }

      // Record item entry in run log
      await prisma.assignmentAutomationItem.create({
        data: {
          runId: automationRun.id,
          assignmentId: assignment.id,
          internId: row.internId,
          memberId: member.id,
          sourceDay: row.day,
          sourceDate: targetDateISO,
          campaign: row.campaign,
          idempotencyKey,
          createdStatus: 'CREATED',
          emailStatus,
          lastError: emailError,
        },
      });

      resultItems.push({
        internId: row.internId,
        internName: row.internName,
        assignmentId: assignment.id,
        createdStatus: 'CREATED',
        emailStatus,
        error: emailError || undefined,
      });
    } catch (err: any) {
      console.error(`❌ [AssignmentAutomation] Failed item for ${row.internId} (${row.internName}):`, err.message);
      failedCount++;

      await prisma.assignmentAutomationItem.create({
        data: {
          runId: automationRun.id,
          internId: row.internId,
          sourceDay: row.day,
          sourceDate: targetDateISO,
          campaign: row.campaign,
          idempotencyKey,
          createdStatus: 'FAILED',
          emailStatus: 'SKIPPED',
          lastError: err.message,
        },
      }).catch(() => null);

      resultItems.push({
        internId: row.internId,
        internName: row.internName,
        createdStatus: 'FAILED',
        emailStatus: 'SKIPPED',
        error: err.message,
      });
    }
  }

  const finalStatus = failedCount === 0 ? 'COMPLETED' : emailSentCount > 0 ? 'EMAIL_PENDING' : 'FAILED';

  // Update Automation Run record
  await prisma.assignmentAutomationRun.update({
    where: { id: automationRun.id },
    data: {
      actualEndTime: new Date(),
      createdCount,
      emailSentCount,
      failedCount,
      skippedDuplicateCount,
      status: finalStatus,
      errorDetails: failedCount > 0 ? `${failedCount} interns failed automation step` : null,
    },
  });

  // Write system audit log
  await prisma.auditLog.create({
    data: {
      actorId: options.triggeredBy || 'CRON_SYSTEM',
      actorEmail: 'system@sarthi.in',
      actorName: 'Assignment Automation Scheduler',
      action: 'DAILY_ASSIGNMENT_AUTOMATION_RUN',
      entityType: 'AssignmentAutomationRun',
      entityId: automationRun.id,
      entityName: `Daily Assignments ${targetDateISO} (Day ${rows[0].day})`,
      metadata: JSON.stringify({
        dateISO: targetDateISO,
        expectedCount: rows.length,
        createdCount,
        emailSentCount,
        failedCount,
        skippedDuplicateCount,
        status: finalStatus,
      }),
    },
  }).catch((err) => console.error(`[AuditLogError] ${err.message}`));

  console.log(`✅ [AssignmentAutomation] Finished run ${runId} for ${targetDateISO}: ${createdCount} created, ${emailSentCount} emails sent, ${skippedDuplicateCount} duplicates skipped, ${failedCount} failures.`);

  return {
    runId,
    dateISO: targetDateISO,
    status: finalStatus,
    expectedCount: rows.length,
    createdCount,
    emailSentCount,
    failedCount,
    skippedDuplicateCount,
    items: resultItems,
  };
}
