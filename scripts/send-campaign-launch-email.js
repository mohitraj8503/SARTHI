const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
require('dotenv').config();

const PDF_PATH = '/home/mohitraj8503/Downloads/Python Masterclass Certificate of Completion.pdf';
const TO_EMAIL = process.argv[2] || 'mohitraj8503@gmail.com';

function buildCampaignEmailHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>SARTHI Certificate Promotion Campaign</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
<tr><td align="center">

<table width="680" cellpadding="0" cellspacing="0" style="
  background:#ffffff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 15px 45px rgba(0,0,0,0.08);
  max-width:100%;
">

<!-- Header -->
<tr><td style="
  padding:40px 35px;
  text-align:center;
  background:linear-gradient(135deg,#06122e 0%,#0f2d5c 100%);
">
  <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;">
    SARTHI
  </h1>
  <p style="margin:8px 0 0;font-size:14px;color:#d4a017;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
    📢 Internship Task: Certificate Promotion Campaign
  </p>
</td></tr>

<!-- Body -->
<tr><td style="padding:40px 40px 30px;">
  <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
    Dear Intern Team,
  </p>
  <p style="margin:0 0 24px;font-size:15px;color:#334155;line-height:1.7;">
    We are officially launching a high-impact, coordinated <strong>SARTHI Professional Certificate Promotion Campaign</strong> across all teams. Every team member will focus on showcasing the value, credibility, and career advantages of SARTHI certificates.
  </p>

  <!-- Attached Template Callout -->
  <div style="
    background:#eff6ff;
    border:1px solid #bfdbfe;
    border-left:5px solid #2563eb;
    border-radius:10px;
    padding:20px;
    margin:0 0 30px;
  ">
    <h3 style="margin:0 0 8px;font-size:16px;color:#1e40af;font-weight:700;">📎 Official Certificate Template Included</h3>
    <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">
      The official certificate template (<strong>Python Masterclass Certificate of Completion.pdf</strong>) is attached to this email. You must use this visual template in all promotional posts, reels, banners, articles, and outgoing campaigns.
    </p>
  </div>

  <h2 style="font-size:18px;color:#0f2d5c;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin:28px 0 16px;">
    🎯 Weekly Team Deliverables
  </h2>

  <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;font-size:14px;color:#334155;">
    <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:left;">
      <th style="padding:10px;">Team</th>
      <th style="padding:10px;">Deliverables</th>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px;"><strong>🎥 Creator Team</strong></td>
      <td style="padding:10px;">5 Reels / Shorts per week (15–45s, modern edits, trending audio, CTA)</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px;"><strong>🎨 Design Team (Kajal)</strong></td>
      <td style="padding:10px;">10 Creatives per week (IG, Carousels, Stories, WhatsApp Posters, Banners)</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px;"><strong>✍️ Blog Writers</strong></td>
      <td style="padding:10px;">2 SEO Blogs per week (800–1500 words, unique topics)</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px;"><strong>📱 Social Media Team</strong></td>
      <td style="padding:10px;">1 Post daily across LinkedIn, IG, X, Facebook, and Threads</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px;"><strong>💬 Content Writers</strong></td>
      <td style="padding:10px;">5 Copies per week (Landing page, Headlines, CTAs, Newsletters)</td>
    </tr>
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px;"><strong>📧 Email Marketing Team</strong></td>
      <td style="padding:10px;">2 Email campaigns per week with PDF certificate attached</td>
    </tr>
  </table>

  <h2 style="font-size:18px;color:#0f2d5c;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin:32px 0 16px;">
    📌 Core Guidelines
  </h2>
  <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#475569;line-height:1.8;">
    <li>Promote only SARTHI Certificates.</li>
    <li>Always showcase the attached certificate template as the main visual reference.</li>
    <li>Maintain clean, modern, and high-quality branding.</li>
    <li>Every piece of content must highlight verified skill proof & career growth.</li>
    <li>Always include a clear CTA to enroll and earn certificates at sarthi-woad.vercel.app.</li>
  </ul>

  <div style="text-align:center;margin:35px 0 15px;">
    <a href="https://sarthi-woad.vercel.app" style="
      display:inline-block;
      background:linear-gradient(135deg,#0f2d5c,#1e4d8c);
      color:#ffffff;
      text-decoration:none;
      padding:14px 36px;
      border-radius:10px;
      font-size:15px;
      font-weight:700;
    ">
      Explore SARTHI Certificates
    </a>
  </div>
</td></tr>

<!-- Footer -->
<tr><td style="
  padding:24px 40px;
  text-align:center;
  background:#f8fafc;
  border-top:1px solid #e2e8f0;
">
  <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;">SARTHI Marketing & Operations</p>
  <p style="margin:0;font-size:12px;color:#94a3b8;">© 2026 SARTHI. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

async function main() {
  console.log('🚀 Preparing Certificate Campaign Launch Email...');

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF not found at path: ${PDF_PATH}`);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(PDF_PATH);
  console.log(`✅ Loaded Certificate PDF: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing in environment!');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log(`📧 Sending campaign email to ${TO_EMAIL}...`);

  const { data, error } = await resend.emails.send({
    from: 'SARTHI <admin@sarthi.in>',
    to: [TO_EMAIL],
    subject: '📢 AI Agent Task – Certificate Promotion Campaign (All Internship Teams)',
    html: buildCampaignEmailHtml(),
    attachments: [
      {
        filename: 'Python_Masterclass_Certificate_of_Completion.pdf',
        content: pdfBuffer.toString('base64'),
      },
    ],
  });

  if (error) {
    console.error('❌ Resend API Error:', error);
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Campaign Email Sent Successfully!`);
  console.log(`🆔 Message ID: ${data.id}`);
  console.log(`📎 Attached: Python_Masterclass_Certificate_of_Completion.pdf`);
  console.log(`📬 Delivered to: ${TO_EMAIL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
