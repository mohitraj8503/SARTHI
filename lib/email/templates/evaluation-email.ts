/**
 * Branded Submission Evaluation Email Template for SARTHI
 * Dispatched to interns when a mentor requests revisions (Needs Changes) or rejects a submission.
 * IMPORTANT: privateNotes MUST NEVER be passed or exposed in this template.
 */

export interface EvaluationEmailOptions {
  recipientName: string;
  assignmentTitle: string;
  versionNumber?: number;
  status: 'Needs Changes' | 'Rejected' | string;
  publicFeedback?: string;
  rating?: number;
  xpPenalty?: number;
  resubmitUrl?: string;
}

export function getEvaluationEmailHtml(opts: EvaluationEmailOptions): string {
  const {
    recipientName,
    assignmentTitle,
    versionNumber = 1,
    status,
    publicFeedback = '',
    rating,
    xpPenalty,
    resubmitUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/internship` : 'https://sarthi-woad.vercel.app/dashboard/internship',
  } = opts;

  const firstName = recipientName ? recipientName.trim().split(' ')[0] : 'Intern';
  const isNeedsChanges = status === 'Needs Changes';

  const badgeBg = isNeedsChanges ? '#FEF3C7' : '#FEE2E2';
  const badgeColor = isNeedsChanges ? '#92400E' : '#991B1B';
  const badgeText = isNeedsChanges ? '⚠️ REVISION REQUESTED' : '🔴 NEEDS REVISION';

  // Format public feedback paragraphs
  let parsedFeedback = publicFeedback || 'Please review mentor instructions and submit an updated version.';
  parsedFeedback = parsedFeedback.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  parsedFeedback = parsedFeedback.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  const formattedFeedback = parsedFeedback
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#334155;">${p.replace(/\r?\n/g, '<br />')}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Action Required: ${assignmentTitle}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAF9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAF9;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
        
        <!-- HEADER -->
        <tr>
          <td style="background:#0F291E;padding:32px 32px 28px;text-align:center;">
            <p style="color:#D4AF37;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2.5px;margin:0 0 8px;">SARTHI MENTOR EVALUATION</p>
            <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0 0 6px;line-height:1.3;">Submission Feedback & Updates</h1>
            <p style="color:#A3E635;font-size:13px;margin:0;font-weight:600;">Assignment: ${assignmentTitle} (V${versionNumber})</p>
          </td>
        </tr>

        <!-- BODY CONTENT -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <p style="margin:0 0 18px;font-size:16px;color:#0F172A;font-weight:700;">Dear ${firstName},</p>
            
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
              Your mentor has evaluated your submission for <strong>"${assignmentTitle}"</strong> (Version ${versionNumber}). Please review the feedback below to make the necessary improvements and resubmit.
            </p>

            <!-- STATUS BADGE CARD -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:14px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Evaluation Status</span>
                  <div style="margin-top:6px;">
                    <span style="display:inline-block;background:${badgeBg};color:${badgeColor};padding:4px 12px;border-radius:8px;font-size:12px;font-weight:800;">${badgeText}</span>
                    ${rating ? `<span style="display:inline-block;background:#FFFBEB;color:#B45309;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:800;margin-left:8px;">⭐ Rating: ${rating}/5</span>` : ''}
                    ${xpPenalty && xpPenalty > 0 ? `<span style="display:inline-block;background:#FEE2E2;color:#991B1B;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:800;margin-left:8px;">⚠️ -${xpPenalty} XP</span>` : ''}
                  </div>
                </td>
              </tr>
            </table>

            <!-- MENTOR FEEDBACK -->
            <div style="margin-bottom:28px;">
              <p style="font-size:12px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Mentor Feedback & Instructions</p>
              <div style="background:#FFFFFF;border-left:4px solid ${isNeedsChanges ? '#F59E0B' : '#EF4444'};padding:14px 18px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
                ${formattedFeedback}
              </div>
            </div>

            <!-- CTA BUTTON -->
            <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;margin-bottom:20px;">
              <tr>
                <td align="center">
                  <a href="${resubmitUrl}" target="_blank" style="display:inline-block;background:#174F3A;color:#FFFFFF;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(23,79,58,0.25);">
                    Resubmit Your Task →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#64748B;text-align:center;">
              Don't worry — iteration is a natural part of growth! Submit your updated version to continue progressing.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#F8FAF9;padding:24px 32px;text-align:center;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;">
            <p style="margin:0 0 6px;font-weight:700;color:#475569;">SARTHI Internship Program</p>
            <p style="margin:0 0 10px;">Empowering Students. Building Practical Skills.</p>
            <p style="margin:0;font-size:11px;color:#94A3B8;">
              Need help? Contact <a href="mailto:support@sarthi.in" style="color:#174F3A;text-decoration:underline;">support@sarthi.in</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}
