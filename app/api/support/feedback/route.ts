export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/email/send';

// In-memory rate limiting map for feedback submissions (max 5 requests per IP per 10 mins)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitData = rateLimitMap.get(ip);

  if (!limitData || now > limitData.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }

  if (limitData.count >= 5) {
    return false;
  }

  limitData.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';

  // 1. Rate Limiting Protection
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ error: 'Too many feedback requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();

    // 2. Honeypot Anti-Spam Protection
    if (body.website_hp && body.website_hp.length > 0) {
      // Silent rejection for spam bots
      return NextResponse.json({ success: true, message: 'Feedback received' });
    }

    const { rating, feedback: userFeedback, pointers, email, page, userAgent: clientUserAgent } = body;

    // Basic Validation
    if (!userFeedback || !userFeedback.trim()) {
      return NextResponse.json({ error: 'Feedback text is required.' }, { status: 400 });
    }

    const user = (await getCurrentUser()) as { id: string; name?: string; email?: string } | null;

    // Identify submitter info
    const submitterName = user?.name || 'Guest User';
    const submitterEmail = email?.trim() || user?.email || 'Not provided';
    const currentPage = page || '/';
    const ratingValue = rating ? Number(rating) : 5;
    const pointersList = Array.isArray(pointers) && pointers.length > 0 ? pointers.join(', ') : 'General Experience';
    const nowFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const userAgent = clientUserAgent || request.headers.get('user-agent') || 'Unknown Browser';

    // 3. Save to Database
    const feedbackRecord = await prisma.feedback.create({
      data: {
        userId: user ? user.id : null,
        type: 'WEBSITE_FEEDBACK',
        title: `Rating ${ratingValue}/5 — ${pointersList}`,
        message: `[Page: ${currentPage}]\n[Pointers: ${pointersList}]\n[Email: ${submitterEmail}]\n\n${userFeedback}`,
        rating: ratingValue,
        status: 'PENDING',
      },
    });

    // 4. Send Email Notification via Resend (preserve replyTo)
    const adminEmail = process.env.FEEDBACK_ADMIN_EMAIL || process.env.EMAIL_FROM || 'admin@sarthi.in';
    const starsEmoji = '⭐'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background: #1A3C2E; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">New SARTHI Website Feedback</h2>
          <p style="color: #C8A96A; margin: 4px 0 0; font-size: 14px; font-weight: 600;">Rating: ${starsEmoji} (${ratingValue}/5)</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; color: #334155;">
          <tr>
            <td style="padding: 8px 0; font-weight: 700; width: 120px;">User Name:</td>
            <td style="padding: 8px 0;">${submitterName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">User Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${submitterEmail}" style="color: #2563eb; text-decoration: none;">${submitterEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Page:</td>
            <td style="padding: 8px 0;"><code style="background: #e2e8f0; padding: 2px 6px; rounded: 4px;">${currentPage}</code></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Pointers:</td>
            <td style="padding: 8px 0;">${pointersList}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Submitted At:</td>
            <td style="padding: 8px 0;">${nowFormatted}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Browser / OS:</td>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b;">${userAgent}</td>
          </tr>
        </table>

        <div style="background: #ffffff; border-left: 4px solid #FF8A00; padding: 16px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h4 style="margin: 0 0 8px; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Feedback Content:</h4>
          <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${userFeedback}</p>
        </div>

        <div style="font-size: 12px; color: #94a3b8; text-align: center;">
          Reply directly to this email to respond to <strong>${submitterName}</strong>.
        </div>
      </div>
    `;

    try {
      await sendTransactionalEmail({
        to: adminEmail,
        replyTo: submitterEmail !== 'Not provided' ? submitterEmail : undefined,
        subject: `New SARTHI Website Feedback — ${ratingValue}/5 ⭐`,
        html: emailHtml,
        type: 'notification',
        provider: 'resend',
      });
    } catch (emailErr) {
      console.error('[Feedback Email Dispatch Error]', emailErr);
    }

    return NextResponse.json({ success: true, id: feedbackRecord.id });
  } catch (error) {
    console.error('[Feedback API Error]', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
