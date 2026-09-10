import { Resend } from 'resend';
import { emailEnv } from '../env/email';
import { prisma } from '../prisma';
import { google } from 'googleapis';
import fs from 'fs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const emailFrom = process.env.EMAIL_FROM || 'admin@sarthi.in';

// Initialize OAuth2 client for Gmail REST API
const oAuth2Client = (gmailRefreshToken && googleClientId && googleClientSecret)
  ? new google.auth.OAuth2(googleClientId, googleClientSecret)
  : null;

if (oAuth2Client && gmailRefreshToken) {
  oAuth2Client.setCredentials({ refresh_token: gmailRefreshToken });
}

export interface TransactionalEmailPayload {
  to: string | string[];
  cc?: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  type: 'verification' | 'password-reset' | 'receipt' | 'enrollment' | 'certificate' | 'notification' | 'application';
  attachments?: any[];
  userId?: string;
  provider?: 'gmail' | 'resend';
}

/**
 * Builds an RFC 2822 raw message (base64url encoded) for the Gmail API.
 * - No attachments: uses Content-Type: text/html directly (simpler, more reliable)
 * - With attachments: uses multipart/mixed
 */
function buildRawMessage({
  to,
  cc,
  subject,
  html,
  attachments = [],
}: {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  attachments?: any[];
}): string {
  const recipientList = Array.isArray(to) ? to.join(', ') : to;
  const ccList = cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : '';
  const utf8Subject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const utf8From = `=?UTF-8?B?${Buffer.from('SARTHI').toString('base64')}?= <${emailFrom}>`;

  let rawLines: string[];

  if (!attachments || attachments.length === 0) {
    // Simple HTML-only email — no multipart needed
    const htmlBase64 = Buffer.from(html).toString('base64');
    rawLines = [
      `To: ${recipientList}`,
      ...(ccList ? [`Cc: ${ccList}`] : []),
      `From: ${utf8From}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      htmlBase64,
    ];
  } else {
    // Multipart with attachments
    const boundary = '____bounds_' + Math.random().toString(36).substring(2);
    rawLines = [
      `To: ${recipientList}`,
      ...(ccList ? [`Cc: ${ccList}`] : []),
      `From: ${utf8From}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(html).toString('base64'),
      '',
    ];

    for (const att of attachments) {
      let contentBase64 = '';
      if (att.content) {
        contentBase64 = Buffer.isBuffer(att.content)
          ? att.content.toString('base64')
          : typeof att.content === 'string'
          ? att.content
          : Buffer.from(att.content).toString('base64');
      } else if (att.path) {
        contentBase64 = fs.readFileSync(att.path).toString('base64');
      }
      rawLines.push(
        `--${boundary}`,
        `Content-Type: application/octet-stream; name="${att.filename}"`,
        `Content-Disposition: attachment; filename="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        '',
        contentBase64,
        ''
      );
    }
    rawLines.push(`--${boundary}--`);
  }

  return Buffer.from(rawLines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends a transactional email via:
 *   1. Gmail REST API (OAuth2) — primary, uses GMAIL_REFRESH_TOKEN
 *   2. Resend — fallback if Gmail fails
 *   3. Console log only — if neither is configured (dev mode)
 */
export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  attachments = [],
  replyTo,
  userId,
  type = 'notification',
  provider
}: TransactionalEmailPayload) {
  try {
    const computedText = text || html
      .replace(/<style[^>]*>.*<\/style>/gms, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // ── 1. Gmail REST API (primary) ──────────────────────────────────
    if (oAuth2Client && provider !== 'resend') {
      console.log(`[Email/Gmail] Sending (${type}) → ${Array.isArray(to) ? to.join(', ') : to}`);
      try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const raw = buildRawMessage({ to, subject, html, attachments });

        const res = await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw },
        });

        await prisma.emailLog.create({
          data: {
            messageId: res.data.id || 'gmail-id',
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
            type,
            status: 'sent',
            userId: userId || null,
          },
        });

        console.log(`[Email/Gmail] ✓ Sent successfully | id: ${res.data.id}`);
        return { success: true, messageId: res.data.id, provider: 'gmail' };

      } catch (gmailErr: any) {
        console.error(`[Email/Gmail] ✗ Failed — ${gmailErr.message}`);
        // Fall through to Resend
      }
    }

    // ── 2. Resend (fallback) ─────────────────────────────────────────
    if (resend && process.env.RESEND_API_KEY) {
      console.log(`[Email/Resend] Sending (${type}) → ${Array.isArray(to) ? to.join(', ') : to}`);
      const formattedAttachments = attachments?.map((att: any) => {
        const item: any = { filename: att.filename };
        if (att.content) {
          item.content = Buffer.isBuffer(att.content) ? att.content : Buffer.from(att.content);
        } else if (att.path && (att.path.startsWith('http://') || att.path.startsWith('https://'))) {
          item.path = att.path;
        } else if (att.path && fs.existsSync(att.path)) {
          item.content = fs.readFileSync(att.path);
        }
        return item;
      });

      const { data, error } = await resend.emails.send({
        from: emailEnv.EMAIL_FROM!,
        to: Array.isArray(to) ? to : [to],
        reply_to: replyTo,
        subject,
        html,
        text: computedText,
        attachments: formattedAttachments,
        headers: { 'X-Email-Type': type },
      });

      if (error) {
        console.error(`[Email/Resend] ✗ Failed:`, error);
        await prisma.emailLog.create({
          data: {
            to: Array.isArray(to) ? to.join(', ') : to,
            subject, type, status: 'failed',
            error: JSON.stringify(error),
            userId: userId || null,
          },
        });
        return { success: false, error: 'Email send failed. Our team has been notified.' };
      }

      await prisma.emailLog.create({
        data: {
          messageId: data?.id,
          to: Array.isArray(to) ? to.join(', ') : to,
          subject, type, status: 'sent',
          userId: userId || null,
        },
      });

      console.log(`[Email/Resend] ✓ Sent | id: ${data?.id}`);
      return { success: true, messageId: data?.id, provider: 'resend' };
    }

    // ── 3. No provider (dev fallback) ────────────────────────────────
    console.log(`[Email/Mock] No provider configured. To: ${to}, Subject: ${subject}`);
    return { success: true, messageId: 'mock-id', provider: 'mock' };

  } catch (err: any) {
    console.error(`[Email] Unexpected error (${type}):`, err);
    return { success: false, error: 'Email service temporarily unavailable.' };
  }
}
