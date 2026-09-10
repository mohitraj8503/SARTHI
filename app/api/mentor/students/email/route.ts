import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { API } from '@/lib/api/response';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getBrandedTemplate } from '@/lib/email/templates/branded';
import { generateSchoolProposalHtml } from '@/lib/email/templates/school-proposal';

export const dynamic = 'force-dynamic';

const MANAGEMENT_ROLES = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'];

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return API.unauthorized();
    }

    const role = (user.role as string)?.toUpperCase();
    if (!MANAGEMENT_ROLES.includes(role)) {
      return API.forbidden('Mentor access required');
    }

    const data = await request.json();
    const { emails, subject, message, targetType, badge, highlight, actionLabel, actionUrl, attachments, schoolName, principalName } = data;

    if (!subject?.trim() || !message?.trim()) {
      return API.badRequest("Required fields: 'subject' and 'message'.");
    }

    const senderName = 'SARTHI Team';

    const isSchoolProposal = badge === 'SCHOOL PARTNERSHIP PROPOSAL' || badge === 'SCHOOL PROPOSAL';
    let html = '';

    if (isSchoolProposal) {
      let targetSchool = schoolName?.trim() || '';
      if (!targetSchool && subject.includes('—')) {
        const parts = subject.split('—');
        if (parts[1]) targetSchool = parts[1].replace(/Partnership Proposal/i, '').trim();
      }
      if (!targetSchool) targetSchool = 'School';

      html = generateSchoolProposalHtml({ 
        schoolName: targetSchool,
        principalName: principalName?.trim() || undefined
      });
    } else {
      html = getBrandedTemplate({
        badge: badge?.trim() || undefined,
        heading: subject.trim(),
        body: message.trim(),
        highlight: highlight?.trim() || undefined,
        action: actionLabel?.trim() && actionUrl?.trim()
          ? { label: actionLabel.trim(), url: actionUrl.trim() }
          : undefined,
        senderName,
      });
    }

    // ── PLATFORM-WIDE BROADCAST ──────────────────────────────────────
    if (targetType === 'all_platform') {
      const allUsers = await prisma.user.findMany({
        where: {
          role: { in: ['STUDENT', 'USER'] },
          status: { in: ['ACTIVE', 'APPROVED', 'verified', 'active'] },
        },
        select: { email: true },
        take: 2000,
      });

      const recipientEmails = allUsers.map(u => u.email).filter(Boolean) as string[];

      if (recipientEmails.length === 0) {
        return API.badRequest('No active students found on the platform.');
      }

      console.log(`[Email Broadcast] Sending to ${recipientEmails.length} platform users...`);

      const batchSize = 50;
      let sent = 0;
      for (let i = 0; i < recipientEmails.length; i += batchSize) {
        const batch = recipientEmails.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(recipient => sendTransactionalEmail({ to: recipient, subject: subject.trim(), html, type: 'notification', attachments, provider: 'resend' }))
        );
        sent += results.filter(r => r.success).length;
      }

      return API.ok(
        { success: true, recipientCount: recipientEmails.length, sent },
        `Successfully dispatched to ${sent} of ${recipientEmails.length} platform users.`
      );
    }

    // ── TARGETED / CUSTOM BROADCAST ─────────────────────────────────
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return API.badRequest("Required field: 'emails' (array) is required for non-platform broadcasts.");
    }

    const uniqueEmails = Array.from(new Set(emails.filter((e: string) => e && e.includes('@')))) as string[];

    if (uniqueEmails.length === 0) {
      return API.badRequest('No valid email addresses provided.');
    }

    console.log(`[Email Broadcast] Sending to ${uniqueEmails.length} recipients...`);

    const results = await Promise.all(
      uniqueEmails.map(recipient =>
        sendTransactionalEmail({ to: recipient, subject: subject.trim(), html, type: 'notification', attachments, provider: 'resend' })
      )
    );

    const sent = results.filter(r => r.success).length;
    const failed = results.length - sent;

    console.log(`[Email Broadcast] Complete: ${sent} sent, ${failed} failed`);

    if (sent === 0) {
      return NextResponse.json({ error: 'All emails failed to send. Check server logs.' }, { status: 500 });
    }

    return API.ok(
      { success: true, sent, failed },
      failed > 0
        ? `Sent ${sent} emails. ${failed} failed.`
        : `Successfully sent ${sent} email(s).`
    );

  } catch (error: any) {
    console.error('[Email Broadcast] Error:', error);
    return API.server('Internal Server Error: ' + error.message);
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return API.unauthorized();

    const count = await prisma.user.count({
      where: {
        role: { in: ['STUDENT', 'USER'] },
        status: { in: ['ACTIVE', 'APPROVED', 'verified', 'active'] },
      },
    });

    return API.ok({ count });
  } catch (error: any) {
    console.error('[Email GET] Error:', error);
    return API.server('Internal Server Error');
  }
}
