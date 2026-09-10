import 'dotenv/config';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { getBrandedTemplate } from '@/lib/email/templates/branded';

async function sendEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in .env');
  }

  const resend = new Resend(apiKey);
  const recipientEmail = 'keshavruhela25@gmail.com';
  const recipientName = 'Keshav Ruhela';
  const internId = 'TTI000066';
  const refNo = 'TT-INT-2026-0066';
  
  const reportDocxPath = '/home/mohitraj8503/Documents/Internship Report - Keshav Ruhela - NyayaSetu - IILM University.docx';

  if (!fs.existsSync(reportDocxPath)) {
    throw new Error(`Report document not found at: ${reportDocxPath}`);
  }

  const reportBuffer = fs.readFileSync(reportDocxPath);
  const reportBase64 = reportBuffer.toString('base64');

  const subject = 'Seeing You Off: Here is Your Official Internship Report | SARTHI';
  
  const bodyText = `Dear ${recipientName},

Congratulations on successfully completing your 1-Month Software Development Internship under the July 2026 Batch at SARTHI!

It has been an absolute pleasure having you on board. Over the past month, we watched you grow from mastering the core fundamentals of web development—semantic HTML5 architecture, modern responsive CSS3 design systems, and core JavaScript ES6+ state handling—to tackling real-world engineering challenges. 

Your dedication and engineering contributions to our flagship citizen navigation engine, **NyayaSetu (न्यायसेतु)**, alongside Team Sankalp under the mentorship of Mohit Raj, have been exemplary. You built an intuitive, accessible guidance platform that helps everyday Indian citizens navigate public services directly without intermediaries or confusion.

As you step into your next academic semester and future engineering endeavors at **IILM University**, we are proud to see you off with your **Official Internship Project Report** formatted strictly according to IILM University guidelines.

Please find your official personalized internship report attached to this email. You can directly submit or print this document for your departmental evaluation.

### Your Internship Highlights
• **Permanent Intern ID:** ${internId}
• **Official Reference No.:** ${refNo}
• **Track:** Software Development (Web Development)
• **Project Deliverable:** NyayaSetu (न्यायसेतु) — Citizen Action & Government Navigation Engine
• **Open Source Codebase:** github.com/mohitraj8503/Nyaya-Setu
• **Tenure:** 21-Jul-2026 to 21-Aug-2026

We wish you immense success in your engineering journey, hackathons, and career. Our doors and mentorship are always open for you.

Keep building, stay curious, and lead tomorrow!`;

  const highlightText = `Your official, formatted IILM University Internship Report document is attached to this email. Please review the contents and reach out if you require any additional departmental signatures.`;

  const htmlContent = getBrandedTemplate({
    badge: 'INTERNSHIP COMPLETION',
    heading: 'Seeing You Off: Here is Your Official Internship Report',
    body: bodyText,
    highlight: highlightText,
    action: {
      label: 'Explore GitHub Repository',
      url: 'https://github.com/mohitraj8503/Nyaya-Setu',
    },
    senderName: 'Mohit Raj & Mukul Pandey (Co-Founders, SARTHI)',
  });

  console.log(`Sending branded farewell & report email to ${recipientName} (${recipientEmail})...`);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SARTHI <admin@sarthi.in>',
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'Internship Report - Keshav Ruhela - NyayaSetu - IILM University.docx',
          content: reportBase64,
        },
      ],
    }),
  });

  const json = await response.json();
  console.log('✅ Resend API Response Status:', response.status);
  console.log('✅ Resend API Response Body:', JSON.stringify(json, null, 2));
}

sendEmail().catch(err => {
  console.error('❌ Failed to send email:', err);
  process.exit(1);
});
