import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';

const HARSH_EMAIL = 'harshnayan018@gmail.com';
const HARSH_MEMBER_ID = 'cmsbeolbj000rtf2asudd28xu';
const BATCH_ID = 'cmr5vh9ze0002xhb424ocehpb';

async function main() {
  const isConfirm = process.argv.includes('--confirm');

  // Deadline: 20th August 2026 (23:59:59 IST)
  const deadline = new Date('2026-08-20T23:59:59+05:30');

  const title = 'Vyapaari-Plus — AI-First Business Operating System for Indian Local Businesses';
  const description = `## Project Overview
Welcome **Harsh Nayan**! As part of your **Software Development Internship** at **SARTHI**, you have been assigned to lead the development and architecture of **Vyapaari-Plus** ([mohitraj8503/vyapaari-plus](https://github.com/mohitraj8503/vyapaari-plus)).

Vyapaari-Plus is an AI-first Business Operating System specifically engineered for Indian local businesses, kirana stores, small merchants, and service enterprises.

---

### Core Objectives & Deliverables

#### 1. Repository Setup & Architecture
• Clone repository: \`https://github.com/mohitraj8503/vyapaari-plus\`
• Set up clean modular structure using HTML5, CSS3, JavaScript (ES6+), and LocalStorage/JSON mock APIs.

#### 2. Key Modules & Features
• **Smart Billing & GST Invoice Generator**: Quick digital receipt creation with WhatsApp sharing link.
• **AI Inventory & Khata Ledger**: Voice/text entry for customer credit tracking (Udhar/Khata) and low-stock alerts.
• **Local Customer Growth & Offers**: Auto-generate discount posters and promotional broadcast messages for festival sales.
• **Analytics Dashboard**: Daily revenue summary, top-selling items, and profit margin breakdown.

#### 3. Technical Requirements
• Mobile-first responsive UI tailored for smartphones used by shopkeepers.
• Bilingual / Hindi + English UI support.
• 100% offline-first storage fallback using browser Web Storage API.

---

### Expected Submission Format
1. Forked / Cloned GitHub repository link with clean commits.
2. Verified \`README.md\` documentation detailing project features, tech stack, and setup steps.
3. Live hosted demo (Vercel / GitHub Pages) or working video walkthrough.

---

Regards,
**Mohit Raj & SARTHI Team**`;

  console.log('----------------------------------------------------');
  console.log('🚀 ASSIGNING VYAPAARI-PLUS & CLEANING SCHEDULED TASKS');
  console.log('----------------------------------------------------');

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
        category: 'Full-Stack Web Development & AI Architecture',
        difficulty: 'Advanced',
        estimatedTime: '2 Days',
        xpReward: 450,
        deadline,
        mode: 'INDIVIDUAL',
        status: 'active',
        memberId: HARSH_MEMBER_ID,
        recipients: {
          create: [{ memberId: HARSH_MEMBER_ID }],
        },
      },
    });
    console.log(`✅ Vyapaari-Plus Assignment created in DB! ID: ${assignment.id}`);
  } else {
    assignment = await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: {
        description,
        deadline,
        status: 'active',
      },
    });
    console.log(`✅ Existing Vyapaari-Plus Assignment updated in DB! ID: ${assignment.id}`);
  }

  // 2. Clean up Scheduled Tasks for Harsh Nayan
  const harshMemberIds = ['cmsbeolbj000rtf2asudd28xu', 'cmr7x596g00051b9pt5b7i1g2'];
  const deletedHarshScheduled = await prisma.internshipAssignment.deleteMany({
    where: {
      status: 'scheduled',
      id: { not: assignment.id },
      recipients: {
        some: {
          memberId: { in: harshMemberIds },
        },
      },
    },
  });
  console.log(`🧹 Deleted ${deletedHarshScheduled.count} scheduled tasks for Harsh Nayan.`);

  // 3. Clean up Scheduled Tasks for ALL Suspended Members
  const suspendedMembers = await prisma.batchMember.findMany({
    where: {
      OR: [{ status: 'SUSPENDED' }, { user: { status: 'SUSPENDED' } }],
    },
    select: { id: true },
  });
  const suspendedMemberIds = suspendedMembers.map((m) => m.id);

  const deletedSuspendedScheduled = await prisma.internshipAssignment.deleteMany({
    where: {
      status: 'scheduled',
      recipients: {
        some: {
          memberId: { in: suspendedMemberIds },
        },
      },
    },
  });
  console.log(`🧹 Deleted ${deletedSuspendedScheduled.count} scheduled tasks for Suspended Members.`);

  // 4. Format Email Preview
  const emailHtml = getBrandedTemplate({
    badge: 'MAJOR PROJECT ASSIGNED',
    heading: 'New Assignment: Vyapaari-Plus — AI-First Business Operating System',
    body: `Dear **Harsh Nayan**,

We are pleased to assign your flagship project for the **Software Development Internship** at **SARTHI**!

**Assignment Details:**
• **Project:** Vyapaari-Plus (AI-first Business Operating System for Indian Local Businesses)
• **Repo:** [mohitraj8503/vyapaari-plus](https://github.com/mohitraj8503/vyapaari-plus)
• **Ref No.:** TT-INT-2026-0019
• **Submission Deadline:** 20-Aug-2026 (23:59 IST)
• **XP Reward:** 450 XP

**Core Features to Build:**
1. **Smart Billing & GST Receipt Generator**: Quick receipt engine with WhatsApp share links.
2. **AI Inventory & Khata Ledger**: Voice/text entry for customer credit (udhar) tracking.
3. **Local Customer Growth & Marketing**: Discount poster generator for small shopkeepers.
4. **Analytics Dashboard**: Daily sales, profit margin, and top-selling inventory tracking.

Your complete project specification is now active in your **SARTHI Intern Workspace**.`,
    highlight: '🎯 **Task Live in Workspace:** Log in to your intern dashboard to view full specifications and submit your repository link.',
    action: {
      label: 'ACCESS INTERN WORKSPACE',
      url: 'https://sarthi-woad.vercel.app/dashboard/internship',
    },
    senderName: 'SARTHI Team',
  });

  console.log('\n----------------------------------------------------');
  console.log('📧 ASSIGNMENT EMAIL PREVIEW FOR HARSH NAYAN');
  console.log('----------------------------------------------------');
  console.log(`Target Recipient: Harsh Nayan <${HARSH_EMAIL}>`);
  console.log(`Subject: New Flagship Assignment: Vyapaari-Plus AI Operating System (Harsh Nayan)`);

  if (!isConfirm) {
    console.log('\n----------------------------------------------------');
    console.log('⚠️ DRY RUN MODE ACTIVE — Assignment & Cleanup saved in DB. Email will NOT be sent until confirmed.');
    console.log('Run with --confirm flag to send the notification email via Resend API.');
    console.log('----------------------------------------------------');
    return;
  }

  console.log('\n🚀 SENDING ASSIGNMENT EMAIL VIA RESEND API...');
  const result = await sendTransactionalEmail({
    to: HARSH_EMAIL,
    subject: `New Flagship Assignment: Vyapaari-Plus AI Operating System (Harsh Nayan)`,
    html: emailHtml,
    type: 'assignment',
    provider: 'resend',
  });

  console.log(`✅ Email successfully delivered to Harsh Nayan <${HARSH_EMAIL}> (ID: ${result.id || 'OK'})`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
