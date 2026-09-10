import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getLinkedInReminderEmailHtml } from '@/lib/email/templates/linkedin-reminder-email';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { memberIds = [], sendToAllMissing = false } = body;

    // Fetch batch members for mentor or target list
    let members = await prisma.batchMember.findMany({
      where: memberIds.length > 0 && !sendToAllMissing ? {
        id: { in: memberIds }
      } : {
        status: 'ACTIVE'
      },
      include: {
        user: {
          include: {
            internshipApplications: true
          }
        }
      }
    });

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();

    const results = {
      sentCount: 0,
      skippedThrottledCount: 0,
      alreadyHasLinkedinCount: 0,
      details: [] as any[]
    };

    for (const member of members) {
      const u = member.user;
      if (!u || !u.email) continue;

      // Check if LinkedIn exists in user.socialLinks or internshipApplications
      let hasLinkedin = false;
      try {
        if (u.socialLinks) {
          const links = JSON.parse(u.socialLinks);
          if (links.linkedin && links.linkedin.trim().length > 5) hasLinkedin = true;
        }
      } catch (e) {}

      if (!hasLinkedin && u.internshipApplications && u.internshipApplications.length > 0) {
        const app = u.internshipApplications[0];
        if (app.linkedin && app.linkedin.trim().length > 5) hasLinkedin = true;
      }

      if (hasLinkedin) {
        results.alreadyHasLinkedinCount++;
        results.details.push({ email: u.email, name: u.name, status: 'ALREADY_HAS_LINKEDIN' });
        continue;
      }

      // Check throttling (7 days)
      if (member.lastLinkedInReminderSentAt) {
        const diffMs = now.getTime() - new Date(member.lastLinkedInReminderSentAt).getTime();
        if (diffMs < SEVEN_DAYS_MS) {
          const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          results.skippedThrottledCount++;
          results.details.push({ email: u.email, name: u.name, status: 'THROTTLED', daysAgo });
          continue;
        }
      }

      // Send branded reminder email
      const html = getLinkedInReminderEmailHtml({ recipientName: u.name || 'Scholar' });
      await sendTransactionalEmail({
        to: u.email,
        subject: 'Add your LinkedIn to boost your SARTHI rank 🚀',
        html,
      }).catch(err => {
        console.error(`Failed sending LinkedIn reminder to ${u.email}:`, err);
      });

      // Update throttling timestamp
      await prisma.batchMember.update({
        where: { id: member.id },
        data: { lastLinkedInReminderSentAt: now }
      });

      results.sentCount++;
      results.details.push({ email: u.email, name: u.name, status: 'SENT' });
    }

    return NextResponse.json({
      success: true,
      message: `LinkedIn reminders processed. Sent: ${results.sentCount}, Throttled: ${results.skippedThrottledCount}, Already Added: ${results.alreadyHasLinkedinCount}`,
      results
    });

  } catch (error: any) {
    console.error('Error sending LinkedIn reminders:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
