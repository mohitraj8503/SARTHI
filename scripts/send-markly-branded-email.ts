import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { getBrandedTemplate } from '../lib/email/templates/branded';

dotenv.config();

const prisma = new PrismaClient();

async function sendBrandedTaskEmails() {
  console.log('🎨 Sending official branded email templates via lib/email/templates/branded.ts...');

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY missing!');
    return;
  }

  const resend = new Resend(resendApiKey);

  // 1. Fetch 17 Targeted IILM Web & Software Dev Interns
  const iilmApps = await prisma.internshipApplication.findMany({
    where: {
      college: { contains: 'IILM' },
      domain: { in: ['Web Development', 'Full Stack Web Development', 'Software Development'] },
      status: { in: ['APPROVED', 'OFFER_ACCEPTED'] }
    }
  });

  const issuedCerts = await prisma.issuedCertificate.findMany({});
  const issuedUserIds = new Set(issuedCerts.map(c => c.userId));
  const targetIILM = iilmApps.filter(a => !issuedUserIds.has(a.studentId));

  console.log(`\n📌 1. Sending Branded Markly Task Email to ${targetIILM.length} IILM Web & Software Dev Interns:`);

  for (const intern of targetIILM) {
    const htmlBody = getBrandedTemplate({
      badge: 'MARKLY CORE SPRINT',
      heading: '🚀 Project Markly: AI Examination & Step-Wise Evaluation Platform',
      body: `Hi **${intern.name}** 👋,

As a **${intern.domain || 'Web Development'} Intern** from **IILM University**, you have been assigned your core development sprint on **Markly** — SARTHI's flagship AI-powered examination creation & evaluation operating system.

### 🔗 Key Resources:
• **GitHub Repository:** https://github.com/mohitraj8503/Markly
• **Live Demo Preview:** https://markly.mohitraj8503.workers.dev/templates
• **Full Task Brief:** https://github.com/mohitraj8503/Markly/blob/main/INTERN_ONBOARDING_AND_WEEKLY_TASKS.md

### 💡 What is Markly About?
Traditional grading takes teachers 30–50 hours every exam cycle. Generic AI tools fail because they act as opaque "black boxes" that give arbitrary final marks without explaining intermediate credit.

*"AI reads the paper, extracts step-wise process evidence, awards granular partial credit, and the teacher retains 100% final authority to verify or adjust."*

### 🎯 Deliverables & Track Tasks:
**Frontend & UI/UX Engineers (Web Dev):**
• Enhance A4 Template Preview (CBSE, State Board, University formats) in \`src/app/templates/page.tsx\`.
• Add pan/zoom and red-pen audit pin annotations in \`src/app/grade/page.tsx\`.
• Assemble question sets directly from Question Bank in \`src/app/questions/page.tsx\`.

**Backend & Database Engineers (Software Dev):**
• Set up PostgreSQL production connection in \`prisma/schema.postgresql.prisma\`.
• Build Audit Trail PDF/CSV export for teacher score overrides in \`src/app/api/evaluations/[id]/review/route.ts\`.
• Implement batch upload endpoint (\`POST /api/submissions/batch\`).

### ⚡ Quick Localhost Setup (2 Minutes):
1. Clone repo: \`git clone https://github.com/mohitraj8503/Markly.git\`
2. Install & setup DB: \`npm install && npx prisma db push && npx prisma generate\`
3. Seed & run: \`npx tsx prisma/seed.ts && npm run dev\`

### ⚠️ Non-Negotiable Coding Rules:
• **ZERO hardcoded mock data** — everything connects to the real Prisma database.
• Follow the 5-token physical paper palette (#FAF8F3, #1C1C1E, #26415C, #B23A2E, #5C7A5C).`,
      highlight: `🎯 This task is live on your SARTHI Intern Dashboard. Please review your assigned deliverables, clone the repository, and start your sprint!`,
      action: {
        label: 'Open Intern Dashboard',
        url: 'https://sarthi-woad.vercel.app/dashboard/internship'
      },
      senderName: 'Mohit Raj (Lead Architect & Mentor)'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [intern.email],
        subject: `🚀 Task Assignment: Project Markly (AI Examination Platform)`,
        html: htmlBody
      });

      if (error) {
        console.error(` ❌ Failed for ${intern.email}:`, error);
      } else {
        console.log(` ✅ Sent branded email to ${intern.name} (${intern.email}) | Resend ID: ${data?.id}`);
      }
    } catch (e: any) {
      console.error(` ❌ Error for ${intern.email}:`, e.message);
    }
  }

  // 2. Fetch Digital Marketing Interns
  const dmApps = await prisma.internshipApplication.findMany({
    where: {
      OR: [
        { domain: { contains: 'Digital Marketing' } },
        { domain: { contains: 'Social Media' } },
        { domain: { contains: 'Marketing' } }
      ],
      status: { in: ['APPROVED', 'OFFER_ACCEPTED'] }
    }
  });

  const dmEmails = new Set(dmApps.map(a => a.email.toLowerCase()));
  dmEmails.add('nairjaanvi199@gmail.com');
  dmEmails.add('nandinikatiyar5@gmail.com');

  const allMembers = await prisma.batchMember.findMany({
    include: { user: true }
  });

  const targetDM = allMembers.filter(m => dmEmails.has(m.user.email.toLowerCase()));

  console.log(`\n📌 2. Sending Branded Campaign Task Email to ${targetDM.length} Digital Marketing Interns:`);

  for (const member of targetDM) {
    const htmlBody = getBrandedTemplate({
      badge: 'MARKETING CAMPAIGN SPRINT',
      heading: '📢 Individual Growth Campaign: SARTHI Certificate Drive',
      body: `Hi **${member.user.name || 'Intern'}** 👋,

You have been assigned an **Individual Growth & Digital Marketing Campaign Task** on your SARTHI Intern Dashboard (+500 XP).

### 📌 Campaign Objective:
Drive organic visibility, engagement, and student enrollment for SARTHI Professional Certificates and Industry Courses across your personal and university social channels (LinkedIn, Instagram, WhatsApp, Facebook).

### 📋 Weekly Deliverables:
1. **5 High-Converting Copy Packages:** Draft and publish 5 original promotional posts highlighting certificate credibility, resume boost, and skill verification.
2. **1 Carousel / Creative Package:** Create or curate a 3–5 slide visual carousel on Instagram / LinkedIn explaining why verified certificates matter in 2026.
3. **Organic Student Outreach:** Share campaign materials with college student groups and freshers with clear call-to-action to https://sarthi-woad.vercel.app.
4. **Proof of Work Submission:** Upload post links, screenshots, and lead metrics on the dashboard under this assignment.`,
      highlight: `💡 **Campaign Focus Tip:** Emphasize that SARTHI certificates provide verified proof of project mastery, helping students stand out in resume screening.`,
      action: {
        label: 'View Task in Dashboard',
        url: 'https://sarthi-woad.vercel.app/dashboard/internship'
      },
      senderName: 'Mohit Raj (Lead Architect & Mentor)'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [member.user.email],
        subject: `📢 Individual Campaign Task: Digital Marketing Certificate Drive`,
        html: htmlBody
      });

      if (error) {
        console.error(` ❌ Failed for ${member.user.email}:`, error);
      } else {
        console.log(` ✅ Sent branded email to ${member.user.name} (${member.user.email}) | Resend ID: ${data?.id}`);
      }
    } catch (e: any) {
      console.error(` ❌ Error for ${member.user.email}:`, e.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 All task emails sent using lib/email/templates/branded.ts!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

sendBrandedTaskEmails()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
