/**
 * send-mohit-cert.js
 * Downloads Mohit Raj's certificate PDF from the running server
 * and sends it to mohitraj8503@gmail.com via Resend.
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { Resend } = require('resend');
require('dotenv').config();

// ── Mohit's cert details ───────────────────────────────────────────────────────
const CERT_ID  = 'TT-4U8O-965C';
const NAME     = 'Mohit Raj';
const COURSE   = 'Full Stack Web Dev Mastery';
const DATE     = 'June 4, 2026';
const TO_EMAIL = 'mohitraj8503@gmail.com';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const PDF_URL  = `${BASE_URL}/api/pdf/${CERT_ID}`;

// ── Download PDF ──────────────────────────────────────────────────────────────
function downloadPdf(url) {
  return new Promise((resolve, reject) => {
    console.log(`📥  Downloading PDF: ${url}`);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from server`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30_000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Email HTML ────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Your Certificate – SARTHI</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:48px 20px;">
<tr><td align="center">
<table width="660" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);max-width:100%;">

<!-- Header -->
<tr><td style="padding:50px 40px 40px;text-align:center;background:linear-gradient(160deg,#06122e 0%,#0f2d5c 100%);">
  <img src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="SARTHI" width="72"
       style="display:block;margin:0 auto 18px;border-radius:50%;border:3px solid #d4a017;">
  <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">
    SARTHI
  </h1>
  <p style="margin:8px 0 0;font-size:13px;color:#d4a017;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
    Certificate of Achievement
  </p>
</td></tr>

<!-- Body -->
<tr><td style="padding:50px 52px 40px;">
  <p style="margin:0 0 8px;font-size:15px;color:#64748b;">
    Dear <strong style="color:#0f2d5c;">${NAME}</strong>,
  </p>
  <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#475569;">
    Congratulations! 🎉 Your official <strong>SARTHI Certificate of Achievement</strong> is attached to this email as a PDF.
  </p>

  <!-- Cert card -->
  <div style="background:linear-gradient(135deg,#f8fafc,#eef2ff);border:1px solid #e2e8f0;border-left:4px solid #d4a017;border-radius:14px;padding:24px 28px;margin:0 0 32px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Course</p>
    <p style="margin:0 0 18px;font-size:17px;font-weight:800;color:#0f2d5c;">${COURSE}</p>

    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Credential ID</p>
    <p style="margin:0 0 18px;font-size:14px;font-family:monospace;color:#0f2d5c;font-weight:600;">${CERT_ID}</p>

    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Date Issued</p>
    <p style="margin:0;font-size:14px;color:#475569;">${DATE}</p>
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin:36px 0;">
    <a href="https://sarthi-woad.vercel.app/verify/${CERT_ID}"
       style="display:inline-block;background:linear-gradient(135deg,#0f2d5c,#1e4d8c);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.5px;box-shadow:0 8px 20px rgba(15,45,92,0.25);">
      🔗 Verify Certificate Online
    </a>
  </div>

  <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
    Your certificate is attached as a PDF — print it, frame it, or add it to LinkedIn.
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:28px 40px;text-align:center;background:#f8fafc;border-top:1px solid #f1f5f9;">
  <p style="margin:0 0 6px;font-size:13px;color:#64748b;font-weight:600;">SARTHI</p>
  <p style="margin:0;font-size:12px;color:#94a3b8;">
    Building Skills · Creating Opportunities · Empowering Futures<br>
    © 2026 SARTHI. All Rights Reserved.
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📜  SARTHI – Sending Mohit\'s Cert  ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Student  : ${NAME}`);
  console.log(`  Cert ID  : ${CERT_ID}`);
  console.log(`  Course   : ${COURSE}`);
  console.log(`  To       : ${TO_EMAIL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌  RESEND_API_KEY missing from .env'); process.exit(1);
  }

  // 1. Get PDF
  let pdfBuffer;
  try {
    pdfBuffer = await downloadPdf(PDF_URL);
    console.log(`✅  PDF downloaded  (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    // fallback: use existing mohit-cert.pdf if present
    const local = path.join(process.cwd(), 'mohit-cert.pdf');
    if (fs.existsSync(local)) {
      console.warn(`⚠️   Server unavailable – using local mohit-cert.pdf`);
      pdfBuffer = fs.readFileSync(local);
      console.log(`✅  Local PDF loaded (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`❌  Cannot get PDF: ${err.message}`); process.exit(1);
    }
  }

  // 2. Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log(`\n📧  Sending to ${TO_EMAIL} ...`);

  const { data, error } = await resend.emails.send({
    from: 'SARTHI <admin@sarthi.in>',
    to:   [TO_EMAIL],
    subject: `🎓 Your Certificate – ${COURSE} | SARTHI`,
    html,
    attachments: [{
      filename: `${NAME.replace(/\s+/g,'_')}_${CERT_ID}_Certificate.pdf`,
      content:  pdfBuffer.toString('base64'),
    }],
  });

  if (error) { console.error('❌  Resend error:', error); process.exit(1); }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Email sent!  ID: ${data.id}`);
  console.log(`📬  Delivered to: ${TO_EMAIL}`);
  console.log(`📎  Attachment  : Mohit_Raj_${CERT_ID}_Certificate.pdf`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => { console.error('❌  Fatal:', err.message); process.exit(1); });
