/**
 * send-all-cert-updates.js
 * Sends certificate update emails to all recipients who earned a certificate.
 * - Mohit Raj receives the PDF attachment.
 * - Other users do NOT receive a PDF attachment (only the premium email template).
 * - All emails include a "Verify Certificate Online" button and an "Add to LinkedIn" button.
 */

const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://sarthi-woad.vercel.app';

// ── Download PDF from local server ──────────────────────────────────────────
function downloadPdf(certId) {
  return new Promise((resolve, reject) => {
    const localUrl = `http://localhost:3000/api/pdf/${certId}`;
    console.log(`📥 Downloading PDF from local dev server: ${localUrl}`);
    const req = http.get(localUrl, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Server returned HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(30_000, () => {
      req.destroy();
      reject(new Error('Playwright/Local server PDF generation timed out'));
    });
  });
}

// ── Email HTML Builder ────────────────────────────────────────────────────────
function buildEmailHtml(name, course, certId, dateString, hasPdf) {
  const verifyUrl = `${BASE_URL}/verify/${certId}`;
  
  // Parse date for LinkedIn Add to Profile URL
  let issueYear = '2026';
  let issueMonth = '6'; // Default June
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      issueYear = d.getFullYear().toString();
      issueMonth = (d.getMonth() + 1).toString();
    }
  } catch (e) {}

  const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(course)}&organizationName=Tech+Tomorrow&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certId)}&issueYear=${issueYear}&issueMonth=${issueMonth}`;

  const attachmentNote = hasPdf 
    ? 'is attached to this email as a PDF. You can also view and verify it online anytime.'
    : 'is ready! You can verify it online anytime or add it directly to your LinkedIn profile.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Your Certificate – SARTHI</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:48px 20px;">
<tr><td align="center">

<table width="660" cellpadding="0" cellspacing="0" style="
  background:#ffffff;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.08);
  max-width:100%;
">

<!-- ── Header ── -->
<tr><td style="
  padding:50px 40px 40px;
  text-align:center;
  background:linear-gradient(160deg,#06122e 0%,#0f2d5c 100%);
">
  <img src="https://sarthi-woad.vercel.app/sarthi-logo.png"
       alt="SARTHI" width="72"
       style="display:block;margin:0 auto 18px;border-radius:50%;border:3px solid #d4a017;">
  <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:3px;text-transform:uppercase;">
    SARTHI
  </h1>
  <p style="margin:8px 0 0;font-size:13px;color:#d4a017;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
    Certificate of Achievement
  </p>
</td></tr>

<!-- ── Body ── -->
<tr><td style="padding:50px 52px 40px;">

  <p style="margin:0 0 8px;font-size:15px;color:#64748b;">Dear <strong style="color:#0f2d5c;">${name}</strong>,</p>

  <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#475569;">
    Congratulations! 🎉 Your official <strong>SARTHI Certificate of Achievement</strong> ${attachmentNote}
  </p>

  <!-- Certificate card -->
  <div style="
    background:linear-gradient(135deg,#f8fafc,#eef2ff);
    border:1px solid #e2e8f0;
    border-left:4px solid #d4a017;
    border-radius:14px;
    padding:24px 28px;
    margin:0 0 32px;
  ">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Course</p>
    <p style="margin:0 0 18px;font-size:17px;font-weight:800;color:#0f2d5c;">${course}</p>

    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Credential ID</p>
    <p style="margin:0 0 18px;font-size:14px;font-family:monospace;color:#0f2d5c;font-weight:600;">${certId}</p>

    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">Date Issued</p>
    <p style="margin:0;font-size:14px;color:#475569;">${dateString}</p>
  </div>

  <!-- CTAs -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0;">
    <tr>
      <td align="center" style="padding-bottom: 12px;">
        <a href="${verifyUrl}"
           style="
             display:inline-block;
             background:linear-gradient(135deg,#0f2d5c,#1e4d8c);
             color:#ffffff;
             text-decoration:none;
             padding:14px 35px;
             border-radius:12px;
             font-size:14px;
             font-weight:700;
             letter-spacing:0.5px;
             box-shadow:0 8px 20px rgba(15,45,92,0.25);
             width: 240px;
             text-align: center;
           ">
          🔗 Verify Certificate Online
        </a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="${linkedinUrl}"
           target="_blank"
           style="
             display:inline-block;
             background:#0077b5;
             color:#ffffff;
             text-decoration:none;
             padding:14px 35px;
             border-radius:12px;
             font-size:14px;
             font-weight:700;
             letter-spacing:0.5px;
             box-shadow:0 8px 20px rgba(0,119,181,0.25);
             width: 240px;
             text-align: center;
           ">
          💼 Add to LinkedIn Profile
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:28px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
    Share your success with the world — verify online or add directly to LinkedIn.
  </p>

</td></tr>

<!-- ── Footer ── -->
<tr><td style="
  padding:28px 40px;
  text-align:center;
  background:#f8fafc;
  border-top:1px solid #f1f5f9;
">
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
}

async function main() {
  console.log('🔍 Fetching all users who earned certificates...');

  const certsMap = new Map();

  // 1. Fetch from Certificates (courses)
  try {
    const courseCerts = await prisma.certificate.findMany({
      include: { user: true }
    });
    for (const c of courseCerts) {
      if (c.user && c.user.email) {
        let courseName = 'Full Stack Web Dev Mastery';
        try {
          const meta = JSON.parse(c.metadata || '{}');
          if (meta.course_name) courseName = meta.course_name.replace(/\s+Certification$/, '');
        } catch (err) {}

        const key = `${c.user.email.trim().toLowerCase()}_${c.certificateNumber || c.certificateId}`;
        certsMap.set(key, {
          email: c.user.email.trim().toLowerCase(),
          name: c.user.name || c.user.username || 'Student',
          course: courseName,
          credentialId: c.certificateNumber || c.certificateId,
          issuedAt: c.issuedAt || new Date('2026-06-04'),
        });
      }
    }
  } catch (e) {
    console.error('Error fetching Certificates:', e.message);
  }

  // 2. Fetch from IssuedCertificates (v2 path)
  try {
    const pathCerts = await prisma.issuedCertificate.findMany({
      include: { user: true, certification: true }
    });
    for (const c of pathCerts) {
      if (c.user && c.user.email && c.certification) {
        const key = `${c.user.email.trim().toLowerCase()}_${c.certNumber}`;
        certsMap.set(key, {
          email: c.user.email.trim().toLowerCase(),
          name: c.user.name || c.user.username || 'Student',
          course: c.certification.title,
          credentialId: c.certNumber,
          issuedAt: c.issuedAt || new Date('2026-06-07'),
        });
      }
    }
  } catch (e) {
    console.error('Error fetching IssuedCertificates:', e.message);
  }

  // 3. Fetch from UserCertifications (legacy path)
  try {
    const legacyCerts = await prisma.userCertification.findMany({
      include: { user: true, certification: true }
    });
    for (const c of legacyCerts) {
      if (c.user && c.user.email && c.certification) {
        const key = `${c.user.email.trim().toLowerCase()}_${c.certNumber}`;
        certsMap.set(key, {
          email: c.user.email.trim().toLowerCase(),
          name: c.user.name || c.user.username || 'Student',
          course: c.certification.title,
          credentialId: c.certNumber,
          issuedAt: c.issuedAt || new Date('2026-06-07'),
        });
      }
    }
  } catch (e) {
    console.error('Error fetching UserCertifications:', e.message);
  }

  const certsList = Array.from(certsMap.values());
  console.log(`📋 Found ${certsList.length} unique certificate records to process:`);
  console.log(certsList.map(c => `${c.name} <${c.email}> - ${c.course} (${c.credentialId})`));

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing from .env');
    await prisma.$disconnect();
    return;
  }

  console.log('\n✉️ Starting email dispatch...');
  for (const cert of certsList) {
    // Determine if PDF should be attached (ONLY for Mohit)
    const isMohit = cert.email === 'mohitraj8503@gmail.com' || cert.email === 'mohit8503@sarthi-woad.vercel.app';
    
    const dateString = new Date(cert.issuedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    console.log(`--------------------------------------------------`);
    console.log(`🚀 Processing: ${cert.name} <${cert.email}>`);
    console.log(`   Course: ${cert.course}`);
    console.log(`   Cert ID: ${cert.credentialId}`);
    console.log(`   Date: ${dateString}`);
    console.log(`   Attach PDF: ${isMohit ? 'YES' : 'NO'}`);

    let attachments = undefined;

    if (isMohit) {
      // For Mohit, try downloading the generated PDF
      try {
        const pdfBuffer = await downloadPdf(cert.credentialId);
        console.log(`   ✅ PDF generated dynamically: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
        attachments = [{
          filename: `${cert.name.replace(/\s+/g, '_')}_Certificate.pdf`,
          content: pdfBuffer.toString('base64'),
        }];
      } catch (err) {
        console.warn(`   ⚠️ Could not generate PDF dynamically (${err.message}), using local mohit-cert.pdf fallback`);
        const fallbackPath = path.join(process.cwd(), 'mohit-cert.pdf');
        if (fs.existsSync(fallbackPath)) {
          const pdfBuffer = fs.readFileSync(fallbackPath);
          console.log(`   ✅ Fallback PDF loaded: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);
          attachments = [{
            filename: `${cert.name.replace(/\s+/g, '_')}_Certificate.pdf`,
            content: pdfBuffer.toString('base64'),
          }];
        } else {
          console.error(`   ❌ No PDF fallback file available. Skipping PDF attachment for Mohit.`);
        }
      }
    }

    const htmlContent = buildEmailHtml(cert.name, cert.course, cert.credentialId, dateString, isMohit);

    try {
      const response = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [cert.email],
        subject: `🎓 Your SARTHI Certificate of Achievement – ${cert.course}`,
        html: htmlContent,
        attachments,
      });

      if (response.error) {
        console.error(`   ❌ Resend failed:`, response.error);
      } else {
        console.log(`   ✅ Email sent! Msg ID: ${response.data.id}`);
      }
    } catch (sendError) {
      console.error(`   ❌ Error sending email:`, sendError.message);
    }

    // Rate-limiting delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\n✨ Dispatch completed!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
