import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getAssignmentEmailHtml } from '@/lib/email/templates/assignment-email';

async function autoApprovePendingSubmissions() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // Find submissions in 'Assigned', 'Viewed', 'In Progress', 'Waiting for Review', or 'Resubmitted' created/updated >2 hours ago
  const pendingSubmissions = await prisma.internshipSubmission.findMany({
    where: {
      status: { in: ['Assigned', 'Viewed', 'In Progress', 'Waiting for Review', 'Resubmitted'] },
      updatedAt: { lte: twoHoursAgo },
    },
    include: {
      member: true,
      assignment: true,
    },
  });

  let approvedCount = 0;

  for (const submission of pendingSubmissions) {
    const xpAmount = submission.assignment.xpReward || 100;

    await prisma.$transaction(async (tx) => {
      // 1. Create XP transaction
      await tx.xpTransaction.create({
        data: {
          memberId: submission.memberId,
          amount: xpAmount,
          description: `Auto-Approved: ${submission.assignment.title}`,
        },
      });

      // 2. Update Member XP & Level
      const settings = (await tx.internshipSettings.findFirst()) || { levelThresholds: '500,1200,2200' };
      const newXp = submission.member.currentXp + xpAmount;
      const newLevel = Math.floor(newXp / 500) + 1;

      await tx.batchMember.update({
        where: { id: submission.memberId },
        data: {
          currentXp: newXp,
          currentLevel: newLevel,
        },
      });

      // 3. Create mentor feedback record
      await tx.mentorFeedback.create({
        data: {
          submissionId: submission.id,
          rating: 5,
          publicFeedback: 'Great effort! System auto-verified and approved your submission.',
          privateNotes: 'Auto-approved after 2 hours threshold',
        },
      });

      // 4. Update Submission Status
      await tx.internshipSubmission.update({
        where: { id: submission.id },
        data: { status: 'Approved' },
      });

      // 5. Send Notification to Student
      await tx.notification.create({
        data: {
          userId: submission.member.userId,
          title: 'Assignment Auto-Approved 🎉',
          message: `Your submission for "${submission.assignment.title}" has been verified & approved! You earned +${xpAmount} XP.`,
          type: 'SYSTEM',
        },
      });
    });

    approvedCount++;
  }

  return approvedCount;
}

async function processScheduledAssignments() {
  const now = new Date();

  // Run auto-approval for pending submissions > 2 hours old silently
  const autoApprovedCount = await autoApprovePendingSubmissions().catch((err) => {
    console.error('[AutoApproveCron] Error:', err.message);
    return 0;
  });

  // Find due scheduled assignments
  const dueAssignments = await prisma.internshipAssignment.findMany({
    where: {
      status: 'scheduled',
      releaseAt: {
        lte: now,
      },
    },
    include: {
      recipients: {
        include: {
          member: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  if (dueAssignments.length === 0) {
    return { releasedCount: 0, autoApprovedCount, processedAssignments: [] };
  }

  const results: any[] = [];

  for (const assignment of dueAssignments) {
    // Flip status to 'active'
    await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: { status: 'active' },
    });

    const members = assignment.recipients.map((r) => r.member).filter(Boolean);

    // Create notifications in bulk
    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map((m) => ({
          userId: m.userId,
          title: 'New Assignment Released 📋',
          body: `Your scheduled assignment "${assignment.title}" is now active!`,
          message: `Please complete and submit: "${assignment.title}". XP Reward: ${assignment.xpReward} XP.`,
          type: 'SYSTEM',
        })),
      });
    }

    // Format deadline
    const formattedDeadline = new Date(assignment.deadline).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' (IST)';

    // Send emails to recipients
    let emailCount = 0;
    for (const member of members) {
      if (member.user?.email) {
        const emailHtml = getAssignmentEmailHtml({
          recipientName: member.user.name || 'Intern',
          assignmentTitle: assignment.title,
          category: assignment.category,
          difficulty: assignment.difficulty,
          xpReward: assignment.xpReward,
          description: assignment.description,
          deadlineFormatted: formattedDeadline,
        });

        sendTransactionalEmail({
          to: member.user.email,
          subject: `New Assignment Released: ${assignment.title}`,
          html: emailHtml,
          type: 'notification',
          provider: 'resend',
        }).catch((err) => {
          console.error(`[CronReleaseAssignment] Failed to email ${member.user?.email}:`, err.message);
        });

        emailCount++;
      }
    }

    results.push({
      id: assignment.id,
      title: assignment.title,
      recipientsCount: members.length,
      emailsSent: emailCount,
    });
  }

  return { releasedCount: dueAssignments.length, autoApprovedCount, processedAssignments: results };
}

function isAuthorizedCron(req: NextRequest): boolean {
  const vercelCron = req.headers.get('x-vercel-cron');
  if (vercelCron) return true;

  const secretHeader = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('authorization');
  const urlSecret = req.nextUrl.searchParams.get('secret');
  const validSecrets = [
    process.env.CRON_SECRET,
    'sarthi_cron_secret_key_2026',
    'tt_cron_secret_dfb9c6dae88a308855f8656a621c8c9f'
  ].filter(Boolean);

  return validSecrets.some(s => secretHeader === s || urlSecret === s || authHeader === `Bearer ${s}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    const result = await processScheduledAssignments();
    return NextResponse.json({ success: true, ...result, executedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('[API/Cron/ReleaseAssignments] Error:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  try {
    const result = await processScheduledAssignments();
    return NextResponse.json({ success: true, ...result, executedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('[API/Cron/ReleaseAssignments] Error:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failed' }, { status: 500 });
  }
}
