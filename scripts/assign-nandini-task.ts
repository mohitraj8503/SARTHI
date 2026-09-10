import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';

const MANDINI_EMAIL = 'nandinikatiyar5@gmail.com';
const MANDINI_MEMBER_ID = 'cms34nzyl001i12ri61st2luk';
const BATCH_ID = 'cmr5vh9ze0002xhb424ocehpb';

async function main() {
  const isConfirm = process.argv.includes('--confirm');

  const title = 'Digital Marketing & Growth Campaign Strategy — SARTHI Launch';
  const description = `## Project Overview
Welcome **Nandini Katiyar**! As part of your **Digital Marketing & Social Media Internship** at **SARTHI**, you have been assigned a specialized growth project to lead our brand positioning, content calendar, and organic student acquisition strategy.

### Objective
Design and execute a high-converting **7-Day Digital Marketing & Content Strategy** to expand SARTHI's reach among computer science, AI, and engineering students across Tier-1, 2 & 3 colleges in India.

---

### Task Breakdown & Deliverables

#### 1. Target Audience & Persona Mapping
• Define 2 core student buyer personas (e.g., Final Year CS Student seeking job placements vs 2nd Year Tech Student looking for AI & Web Development internships).
• Identify key pain points: lack of practical project experience, outdated college curriculum, resume gap.

#### 2. 7-Day Multi-Channel Content Strategy
Create a complete 7-day content calendar including:
• **LinkedIn**: 3 In-depth thought leadership posts & infographic slides (AI trends, resume building, tech career roadmaps).
• **Instagram**: 3 Engaging carousel post concepts & short-form video scripts.
• **X (Twitter)**: 2 Technical thread breakdowns explaining practical engineering concepts.
• **Copywriting & Visuals**: Headline hooks, call-to-action (CTA), and brand hashtag sets.

#### 3. Growth Hacking & Student Community Outreach
• Map an organic distribution plan across college WhatsApp tech groups, Telegram student networks, and developer forums (r/developersIndia, LinkedIn groups).
• Conceptualize 1 High-Converting Lead Magnet (e.g., Free AI Roadmap PDF, Masterclass Guide) to capture student leads.

#### 4. Campaign Analytics & Performance Metrics
Define your success tracking matrix:
• **Engagement Metrics**: Likes, Shares, Comments, Saved Ratio.
• **Click-Through-Rate (CTR)**: Link clicks to SARTHI Intern Portal.
• **Lead Conversion**: Number of qualified student applications generated.

---

### Expected Submission Format
1. PDF / Google Docs document containing the complete Content Strategy & Copy Scripts.
2. 7-Day Social Media Content Calendar spreadsheet / table.
3. Link to live/published post drafts or campaign assets.

---

### Guidelines & Quality Standards
• Maintain a professional, inspiring, and authoritative tone representing SARTHI.
• Focus on value-first education rather than hard selling.
• Ensure clear, actionable Call-To-Actions (CTAs) in every piece of content.

Regards,
**Mohit Raj & SARTHI Team**`;

  const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 Days from today (24-Aug-2026)

  // 1. Create or Update Assignment in Database
  let assignment = await prisma.internshipAssignment.findFirst({
    where: {
      batchId: BATCH_ID,
      title,
    },
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId: BATCH_ID,
        title,
        description,
        category: 'Digital Marketing Strategy',
        difficulty: 'Advanced',
        estimatedTime: '5 Days',
        xpReward: 350,
        deadline,
        mode: 'INDIVIDUAL',
        status: 'active',
        memberId: MANDINI_MEMBER_ID,
        recipients: {
          create: [{ memberId: MANDINI_MEMBER_ID }],
        },
      },
    });
    console.log(`✅ Assignment created in DB successfully! ID: ${assignment.id}`);
  } else {
    assignment = await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: {
        description,
        deadline,
        status: 'active',
      },
    });
    console.log(`✅ Existing assignment updated in DB! ID: ${assignment.id}`);
  }

  // 2. Email Formatting via branded.ts
  const emailHtml = getBrandedTemplate({
    badge: 'NEW ASSIGNMENT ASSIGNED',
    heading: 'New Assignment: Digital Marketing & Growth Campaign Strategy',
    body: `Dear **Nandini Katiyar**,

We are pleased to assign your specialized project for the **Digital Marketing & Social Media Internship** at **SARTHI**!

**Assignment Details:**
• **Title:** ${title}
• **Category:** Digital Marketing Strategy
• **Ref No.:** TT-INT-2026-0038
• **Est. Duration:** 5 Days
• **Submission Deadline:** 24-Aug-2026 (23:59 IST)
• **XP Reward:** 350 XP

**Key Responsibilities:**
1. **Audience & Persona Mapping:** Define student personas across engineering colleges.
2. **7-Day Multi-Channel Content Calendar:** Draft high-converting posts for LinkedIn, Instagram & X/Twitter.
3. **Community Growth Strategy:** Plan organic distribution across student developer networks.
4. **KPI Dashboard:** Track CTR, Engagement Rate, and Lead Conversions.

Your complete project brief, templates, and guidelines are now live in your **SARTHI Intern Workspace**.

We look forward to reviewing your strategic growth campaign!`,
    highlight: '🎯 **Task Live in Workspace:** Log in to your intern dashboard to view full specifications, templates, and submit your deliverables.',
    action: {
      label: 'ACCESS INTERN WORKSPACE',
      url: 'https://sarthi-woad.vercel.app/dashboard/internship',
    },
    senderName: 'SARTHI Team',
  });

  console.log('\n----------------------------------------------------');
  console.log('📧 ASSIGNMENT EMAIL PREVIEW FOR NANDINI KATIYAR');
  console.log('----------------------------------------------------');
  console.log(`Target Recipient: Nandini Katiyar <${MANDINI_EMAIL}>`);
  console.log(`Subject: New Project Assignment: Digital Marketing & Growth Campaign Strategy (Nandini Katiyar)`);

  if (!isConfirm) {
    console.log('\n----------------------------------------------------');
    console.log('⚠️ DRY RUN MODE ACTIVE — Assignment saved in DB. Email will NOT be sent until confirmed.');
    console.log('Run with --confirm flag to send the notification email via Resend API.');
    console.log('----------------------------------------------------');
    return;
  }

  console.log('\n🚀 SENDING ASSIGNMENT EMAIL VIA RESEND API...');
  const result = await sendTransactionalEmail({
    to: MANDINI_EMAIL,
    subject: `New Project Assignment: Digital Marketing & Growth Campaign Strategy (Nandini Katiyar)`,
    html: emailHtml,
    type: 'assignment',
    provider: 'resend',
  });

  console.log(`✅ Email successfully delivered to Nandini Katiyar <${MANDINI_EMAIL}> (ID: ${result.id || 'OK'})`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
