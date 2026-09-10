import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { google } from 'googleapis'
import fs from 'fs'

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

/**
 * Helper to build RFC 2822 raw message format with support for multipart mixed (html + attachments).
 */
function buildRawMessage({
  to,
  subject,
  html,
  }: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: any[];
}) {
  const boundary = '____bounds_' + Math.random().toString(36).substring(2);
  const recipientList = Array.isArray(to) ? to.join(', ') : to;

  const utf8Subject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const utf8From = `=?UTF-8?B?${Buffer.from('SARTHI').toString('base64')}?= <${emailFrom}>`;

  const headers = [
    `To: ${recipientList}`,
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
      contentBase64 = att.content; // base64 string
    } else if (att.path) {
      contentBase64 = fs.readFileSync(att.path).toString('base64');
    }
    
    headers.push(
      `--${boundary}`,
      `Content-Type: application/octet-stream; name="${att.filename}"`,
      `Content-Disposition: attachment; filename="${att.filename}"`,
      'Content-Transfer-Encoding: base64',
      '',
      contentBase64,
      ''
    );
  }

  headers.push(`--${boundary}--`);

  return Buffer.from(headers.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function safeSendEmail(payload: any) {
  // 1. Try Gmail REST API if configured
  if (oAuth2Client) {
    try {
      console.log(`[Email] Attempting Gmail REST API send to: ${payload.to}`);
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const raw = buildRawMessage({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments || []
      });

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw }
      });

      console.log(`[Email] Gmail send success: ${res.data.id}`);
      return { success: true, messageId: res.data.id };
    } catch (error: any) {
      console.error(`[Email Error] Gmail REST API sending failed, falling back to Resend...`, error.message);
    }
  }

  // 2. Fallback to Resend
  if (resend && process.env.RESEND_API_KEY) {
    try {
      console.log(`[Email] Attempting Resend fallback send to: ${payload.to}`);
      return await resend.emails.send(payload);
    } catch (error) {
      console.error(`[Email Error] Failed to send via Resend:`, error);
      return { success: false, error };
    }
  }

  console.log(`[Email Mock] Skipping notification (No provider configured): ${payload.subject} to ${payload.to}`);
  return { success: true, messageId: 'mock-id' };
}


// Email 1: Class Scheduled
export async function sendClassScheduledEmail({
  studentEmail,
  studentName,
  teacherName,
  lessonTitle,
  courseName,
  scheduledAt,
  lessonId,
}: {
  studentEmail: string
  studentName: string
  teacherName: string
  lessonTitle: string
  courseName: string
  scheduledAt: Date
  lessonId: string
}) {
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/student/live/${lessonId}`
  const formattedTime = scheduledAt.toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })

  await safeSendEmail({
    from: 'SARTHI <classes@sarthi.in>',
    to: studentEmail,
    subject: `📡 New Live Class Scheduled: ${lessonTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; background: #f5f5f5; 
                   margin: 0; padding: 20px;">
        <div style="max-width: 560px; margin: 0 auto; 
                    background: white; border-radius: 16px; 
                    overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08)">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); 
                      padding: 32px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px">📡</div>
            <h1 style="color: white; margin: 0; font-size: 22px; 
                       font-weight: 700">
              Live Class Scheduled!
            </h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <p style="color: #374151; margin-top: 0">
              Hi <strong>${studentName}</strong>,
            </p>
            <p style="color: #374151">
              <strong>${teacherName}</strong> has scheduled a new live class 
              for your course <strong>${courseName}</strong>.
            </p>

            <!-- Class Card -->
            <div style="background: #f8f7ff; border: 1px solid #e0e7ff; 
                        border-radius: 12px; padding: 20px; margin: 24px 0">
              <div style="font-size: 11px; font-weight: 700; 
                          color: #6366f1; text-transform: uppercase; 
                          letter-spacing: 1px; margin-bottom: 8px">
                Live Class
              </div>
              <div style="font-size: 18px; font-weight: 700; 
                          color: #1f2937; margin-bottom: 4px">
                ${lessonTitle}
              </div>
              <div style="color: #6b7280; font-size: 14px">
                ${courseName}
              </div>
              <div style="margin-top: 16px; padding-top: 16px; 
                          border-top: 1px solid #e0e7ff">
                <div style="color: #374151; font-size: 14px">
                  🗓️ <strong>${formattedTime} IST</strong>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0">
              <a href="${joinUrl}" 
                 style="background: #4f46e5; color: white; 
                        padding: 14px 32px; border-radius: 10px; 
                        text-decoration: none; font-weight: 600; 
                        font-size: 15px; display: inline-block">
                Add to Calendar & Join →
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 13px; text-align: center">
              You'll receive a reminder 1 hour before the class starts.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px 32px; 
                      text-align: center; border-top: 1px solid #f3f4f6">
            <p style="color: #9ca3af; font-size: 12px; margin: 0">
              SARTHI · 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" 
                 style="color: #9ca3af">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// Email 2: 1 Hour Reminder
export async function sendClassReminderEmail({
  studentEmail,
  studentName,
  lessonTitle,
  courseName,
  scheduledAt,
  lessonId,
}: {
  studentEmail: string
  studentName: string
  lessonTitle: string
  courseName: string
  scheduledAt: Date
  lessonId: string
}) {
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/student/live/${lessonId}`

  await safeSendEmail({
    from: 'SARTHI <classes@sarthi.in>',
    to: studentEmail,
    subject: `⏰ Starting in 1 hour: ${lessonTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; background: #f5f5f5; 
                   margin: 0; padding: 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: white; 
                    border-radius: 16px; overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08)">
          
          <div style="background: linear-gradient(135deg, #dc2626, #ea580c); 
                      padding: 32px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px">⏰</div>
            <h1 style="color: white; margin: 0; font-size: 22px; 
                       font-weight: 700">
              Class starts in 1 hour!
            </h1>
          </div>

          <div style="padding: 32px;">
            <p style="color: #374151; margin-top: 0">
              Hi <strong>${studentName}</strong>, don't miss your live class!
            </p>

            <div style="background: #fef2f2; border: 1px solid #fee2e2; 
                        border-radius: 12px; padding: 20px; margin: 20px 0">
              <div style="font-size: 18px; font-weight: 700; color: #1f2937">
                ${lessonTitle}
              </div>
              <div style="color: #6b7280; font-size: 14px; margin-top: 4px">
                ${courseName}
              </div>
              <div style="margin-top: 12px; color: #dc2626; 
                          font-weight: 600; font-size: 14px">
                🔴 Live in ~60 minutes
              </div>
            </div>

            <div style="text-align: center; margin: 24px 0">
              <a href="${joinUrl}"
                 style="background: #dc2626; color: white; 
                        padding: 14px 32px; border-radius: 10px; 
                        text-decoration: none; font-weight: 600; 
                        font-size: 15px; display: inline-block">
                Join Live Class →
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
