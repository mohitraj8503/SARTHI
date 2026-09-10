import { chromium } from 'playwright';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Your Updated Certificate PDF</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f7f4; padding: 40px; margin: 0; color: #1a3c2e;">
  <div style="max-width: 600px; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin: 0 auto;">
    <img src="https://sarthi-woad.vercel.app/sarthi-logo.png" alt="SARTHI Logo" width="80" style="display: block; margin: 0 auto 20px;" />
    <h2 style="text-align: center; font-size: 24px; font-weight: 800; color: #0f2d5c; margin-bottom: 24px;">Your Updated Certificate is Here!</h2>
    <p>Hi Mohit Raj,</p>
    <p>Please find your updated PDF certificate attached to this email. This PDF has been generated with the exact layout and dimensions as the web version.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://sarthi-woad.vercel.app/verify/TT-FSWDM-2026-000001" style="display: inline-block; padding: 14px 30px; background: #0f2d5c; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px;">Verify Online</a>
    </div>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
    <p style="font-size: 12px; color: #64748b; text-align: center;">© 2026 SARTHI. All Rights Reserved.</p>
  </div>
</body>
</html>`;

async function main() {
  const certId = 'TT-FSWDM-2026-000001';
  console.log(`Launching headless browser to print certificate: ${certId}...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const targetUrl = `http://localhost:3000/verify/${certId}`;
  console.log(`Navigating to ${targetUrl}...`);
  
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  
  // Give extra 500ms for animations/fonts to render
  await page.waitForTimeout(500);

  const pdfPath = path.join(process.cwd(), 'mohit-cert.pdf');
  console.log(`Printing to PDF at ${pdfPath}...`);
  
  await page.pdf({
    path: pdfPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log(`PDF print successful!`);

  // Send email
  const pdfBuffer = fs.readFileSync(pdfPath);
  const emails = ['mohitraj8503@gmail.com', 'mohit8503@sarthi-woad.vercel.app'];

  console.log(`Sending email with attachment to: ${emails.join(', ')}`);

  const response = await resend.emails.send({
    from: 'SARTHI <admin@sarthi.in>',
    to: emails,
    subject: '🎓 Your Updated Certificate PDF is Ready',
    html: emailHtml,
    attachments: [
      {
        content: pdfBuffer,
        filename: 'Mohit_Raj_Full_Stack_Web_Development_Mastery.pdf',
        content_type: 'application/pdf',
      }
    ]
  });

  if (response.error) {
    console.error('❌ Resend Error:', response.error);
  } else {
    console.log(`✅ Success! Message ID: ${response.data?.id}`);
  }
}

main().catch(console.error);
