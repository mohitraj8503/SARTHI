import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/email/send';
import { getAssignmentEmailHtml } from '../lib/email/templates/assignment-email';

async function main() {
  const isConfirm = process.argv.includes('--confirm');

  // Cutoff timestamp: current date and time
  const cutoffDate = new Date();
  // Target new deadline: 48 hours from now
  const newDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

  console.log('----------------------------------------------------');
  console.log('🚀 RELEASE SCHEDULED ASSIGNMENTS (DUE UP TO NOW)');
  console.log('----------------------------------------------------');
  console.log(`Cutoff Release Time: ${cutoffDate.toISOString()}`);
  console.log(`New Extended Deadline: ${newDeadline.toISOString()}`);

  const dueAssignments = await prisma.internshipAssignment.findMany({
    where: {
      status: 'scheduled',
      releaseAt: {
        lte: cutoffDate,
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

  console.log(`\n📋 Total Scheduled Assignments Due for Release: ${dueAssignments.length}`);

  if (dueAssignments.length === 0) {
    console.log('✅ No scheduled assignments pending release up to current time.');
    return;
  }

  const formattedDeadlineStr = newDeadline.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' (IST)';

  if (!isConfirm) {
    console.log('\n----------------------------------------------------');
    console.log('⚠️ DRY RUN MODE ACTIVE — No changes made to DB or emails sent.');
    console.log('Run with --confirm flag to execute actual DB release and email notifications.');
    console.log('----------------------------------------------------');
    return;
  }

  let releasedCount = 0;
  let totalEmailsSent = 0;

  for (const assignment of dueAssignments) {
    // 1. Update assignment status to 'active' and deadline to 21st Aug 2026
    await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: {
        status: 'active',
        deadline: newDeadline,
      },
    });

    releasedCount++;
    const members = assignment.recipients.map((r) => r.member).filter(Boolean);

    // 2. Create in-app notifications in bulk
    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map((m) => ({
          userId: m.userId,
          title: 'Assignment Active & Released 📋',
          body: `Your assignment "${assignment.title}" is now active! Deadline extended to 21st Aug 2026.`,
          message: `Please complete and submit: "${assignment.title}". Extended Deadline: 21-Aug-2026 (11:59 PM IST). XP Reward: ${assignment.xpReward} XP.`,
          type: 'SYSTEM',
        })),
      });
    }

    // 3. Dispatch transactional email notifications
    for (const member of members) {
      if (member.user?.email) {
        try {
          const emailHtml = getAssignmentEmailHtml({
            recipientName: member.user.name || 'Intern',
            assignmentTitle: assignment.title,
            category: assignment.category,
            difficulty: assignment.difficulty,
            xpReward: assignment.xpReward,
            description: assignment.description,
            deadlineFormatted: formattedDeadlineStr,
          });

          await sendTransactionalEmail({
            to: member.user.email,
            subject: `New Assignment Released: ${assignment.title}`,
            html: emailHtml,
            type: 'notification',
            provider: 'resend',
          });

          totalEmailsSent++;
        } catch (err: any) {
          console.error(`❌ Email failed for ${member.user.email}:`, err.message || err);
        }
      }
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 SUCCESS: ${releasedCount} Assignments Successfully Released!`);
  console.log(`📅 New Deadline Set: 21st August 2026 (11:59 PM IST)`);
  console.log(`📧 Total Email Notifications Sent: ${totalEmailsSent}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
