/**
 * Branded Email Template for SARTHI — Premium Version
 * Matches the green-on-white institutional design used in certificate/announcement emails.
 */

export interface BrandedEmailOptions {
  /** Badge pill text, e.g. "CERTIFICATE UPDATE" */
  badge?: string;
  subtitle?: string;
  /** Large heading, usually the email subject */
  heading?: string;
  title?: string;
  /** Plain-text or simple HTML body — newlines preserved */
  body?: string;
  contentHtml?: string;
  /** Optional highlighted callout box below the body */
  highlight?: string;
  /** Optional CTA button */
  action?: { label: string; url: string };
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  /** Sender name shown in the sign-off */
  senderName?: string;
}

export function getBrandedTemplate(opts: BrandedEmailOptions): string {
  const badge = opts.badge || opts.subtitle;
  const heading = opts.heading || opts.title || 'SARTHI Notification';
  const rawBody = opts.body || opts.contentHtml || '';
  const highlight = opts.highlight;
  const action = opts.action || (opts.ctaText && opts.ctaUrl ? { label: opts.ctaText, url: opts.ctaUrl } : undefined);
  const senderName = opts.senderName || 'SARTHI Team';

  // Parse Markdown headers (###, ##, #)
  let parsedBody = rawBody || '';
  parsedBody = parsedBody.replace(/^### (.*$)/gim, '\n\n<h3 style="margin:26px 0 14px;font-size:20px;font-weight:700;color:#0f172a;">$1</h3>\n\n');
  parsedBody = parsedBody.replace(/^## (.*$)/gim, '\n\n<h2 style="margin:30px 0 16px;font-size:24px;font-weight:700;color:#0f172a;">$1</h2>\n\n');
  parsedBody = parsedBody.replace(/^# (.*$)/gim, '\n\n<h1 style="margin:34px 0 18px;font-size:28px;font-weight:700;color:#0f172a;">$1</h1>\n\n');

  // Parse Markdown bold (**text**) and italics (*text*)
  parsedBody = parsedBody.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  parsedBody = parsedBody.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  // Format callouts or body highlight markdown cleanups if passed in highlight
  let cleanHighlight = highlight || '';
  cleanHighlight = cleanHighlight.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  cleanHighlight = cleanHighlight.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

  // Format paragraphs (split by double newlines) and inner newlines to <br>
  const formattedBody = parsedBody
    .split(/\r?\n\s*\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      if (p.startsWith('<h1') || p.startsWith('<h2') || p.startsWith('<h3')) {
        return p.replace(/\r?\n/g, '<br />');
      }
      const htmlContent = p.replace(/\r?\n/g, '<br />');
      return `<p style="margin:0 0 18px;font-size:18px;line-height:1.85;color:#1e293b;">${htmlContent}</p>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f8fbf8;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fbf8;padding:50px 20px;">
<tr>
<td align="center">

<table width="680" cellpadding="0" cellspacing="0" style="
background:#ffffff;
border-radius:24px;
overflow:hidden;
box-shadow:0 20px 60px rgba(34,87,60,0.08);
">

<!-- Header -->
<tr>
<td style="
padding:55px 40px;
text-align:center;
background:linear-gradient(180deg,#ffffff,#f7fcf8);
border-bottom:1px solid #eef7f0;
">
<img src="https://sarthi-woad.vercel.app/sarthi-logo.png"
     alt="SARTHI"
     width="80"
     style="display:block;margin:0 auto 20px auto;">
<h1 style="margin:0;font-size:38px;font-weight:700;color:#1f2937;letter-spacing:-1px;">
SARTHI
</h1>
<p style="margin:12px 0 0;font-size:16px;color:#64748b;">
Empowering Future Innovators
</p>
</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:70px 60px;">

${badge ? `
<div style="
display:inline-block;
padding:8px 18px;
background:#eefbf2;
color:#2f855a;
border-radius:999px;
font-size:13px;
font-weight:600;
margin-bottom:30px;
letter-spacing:0.05em;
text-transform:uppercase;
">
${badge}
</div>
` : ''}

<h2 style="
margin:0 0 24px;
font-size:40px;
line-height:1.2;
font-weight:700;
color:#1f2937;
letter-spacing:-1px;
">
${heading}
</h2>

${formattedBody}

${cleanHighlight ? `
<div style="
background:linear-gradient(135deg,#f8fcf9,#eefbf2);
border:1px solid #d8f3dc;
border-radius:18px;
padding:26px;
margin:35px 0;
">
<p style="margin:0;font-size:17px;line-height:1.85;color:#1e293b;">
${cleanHighlight}
</p>
</div>
` : ''}

${action ? `
<div style="text-align:center;margin:45px 0;">
<a href="${action.url}"
style="
display:inline-block;
background:#57b26a;
color:#ffffff;
text-decoration:none;
padding:18px 42px;
border-radius:14px;
font-size:18px;
font-weight:700;
box-shadow:0 10px 25px rgba(87,178,106,0.25);
">
${action.label}
</a>
</div>
` : ''}

<p style="margin-top:45px;font-size:18px;line-height:1.85;color:#475569;">
Warm regards,
</p>
<p style="margin-top:8px;font-size:18px;font-weight:700;color:#0f172a;">
${senderName}
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="
padding:35px;
text-align:center;
background:#fafdfb;
border-top:1px solid #eef7f0;
">
<p style="margin:0 0 10px;font-size:14px;color:#64748b;">
Building Skills. Creating Opportunities. Empowering Futures.
</p>
<p style="margin:0;font-size:13px;color:#94a3b8;">
&copy; 2026 SARTHI. All Rights Reserved.
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
