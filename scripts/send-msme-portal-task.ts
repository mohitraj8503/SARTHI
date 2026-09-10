import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const targetInterns = [
  { name: 'Ayush Singh', email: 'ayushsinghjsr6@gmail.com' },
  { name: 'Harsh Pathak', email: 'pathakharsh584@gmail.com' },
  { name: 'Harshita Kumari Singh', email: 'harshitakum041008@gmail.com' },
  { name: 'Kritika Mohanty', email: 'kritikamohanty2008@gmail.com' }
];

const repoUrl = 'https://github.com/mohitraj8503/SARTHI-MSME';
const docxPath = '/home/mohitraj8503/Downloads/SARTHI MSME Portal.docx';
const pdfPath = '/home/mohitraj8503/Downloads/SARTHI MSME Portal.pdf';

async function main() {
  const isSendMode = process.argv.includes('--send');
  console.log(`🚀 Starting MSME Portal Task Email Dispatch (Send Mode: ${isSendMode})...\n`);

  if (!fs.existsSync(docxPath) || !fs.existsSync(pdfPath)) {
    console.error('❌ Attachment files missing in Downloads folder!');
    process.exit(1);
  }

  const docxBuffer = fs.readFileSync(docxPath);
  const pdfBuffer = fs.readFileSync(pdfPath);

  let successCount = 0;
  let failCount = 0;

  for (const intern of targetInterns) {
    const emailBody = `Hi <strong>${intern.name}</strong> 👋,

<p>You have been assigned a major Web Development project for the <strong>SARTHI MSME Portal</strong>.</p>

<h3>💼 Project Overview &amp; Task Instructions:</h3>
<p>We are building the official SARTHI MSME Portal to serve small &amp; medium enterprise clients across India. Please follow the instructions below to set up your repository and begin feature implementation:</p>

<ol>
  <li><strong>GitHub Repository:</strong> <a href="${repoUrl}">${repoUrl}</a></li>
  <li><strong>Git Branching Requirement:</strong> Clone the repo and create a dedicated feature branch using your name (e.g. <code>feature/${intern.name.toLowerCase().replace(/\s+/g, '-')}-msme-portal</code>).</li>
  <li><strong>Attached Documents:</strong> Review both attached files (<strong>SARTHI MSME Portal.docx</strong> &amp; <strong>SARTHI MSME Portal.pdf</strong>) for complete project specifications, layout guidelines, and feature requirements.</li>
  <li><strong>Development &amp; Submission:</strong> Implement your assigned modules/features on your feature branch, push your commits, and create a Pull Request on GitHub.</li>
</ol>

<h3>📌 Key Deliverables &amp; Focus Areas:</h3>
<ul>
  <li>Responsive UI components for MSME business services</li>
  <li>Clean TypeScript &amp; Next.js architecture</li>
  <li>Interactive portal pages (Services, Pricing, Projects, Contact, Dashboard)</li>
</ul>

<p>Please download and inspect the attached specification documents and start working on your branch immediately. If you have any technical questions, reach out on the Web Development Interns Group.</p>`;

    const htmlContent = getBrandedTemplate({
      badge: 'WEB DEVELOPMENT PROJECT ASSIGNMENT',
      heading: 'SARTHI MSME Portal Project Assignment 🚀',
      body: emailBody,
      action: {
        label: 'Open GitHub Repository →',
        url: repoUrl
      },
      senderName: 'SARTHI Engineering Team'
    });

    if (!isSendMode) {
      console.log(`[DRY RUN] Prepared email for ${intern.name} (${intern.email}) with 2 attachments.`);
      continue;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [intern.email],
        subject: '🚀 Web Dev Project Assignment: SARTHI MSME Portal Implementation',
        html: htmlContent,
        attachments: [
          {
            filename: 'SARTHI MSME Portal.docx',
            content: docxBuffer,
          },
          {
            filename: 'SARTHI MSME Portal.pdf',
            content: pdfBuffer,
          }
        ]
      });

      if (error) {
        console.error(`❌ Resend failed for ${intern.email}:`, error);
        failCount++;
      } else {
        console.log(`✅ Branded Email + 2 Attachments sent to ${intern.name} (${intern.email}) | ID: ${data?.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending email to ${intern.email}:`, err.message);
      failCount++;
    }
  }

  if (isSendMode) {
    console.log(`\n🎉 MSME Portal Email Dispatch Completed! Success: ${successCount}, Failed: ${failCount}`);
  } else {
    console.log(`\nℹ️ Dry run completed. Run with --send flag after explicit user confirmation.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
