import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { getBrandedTemplate } from '../lib/email/templates/branded';

dotenv.config();

const prisma = new PrismaClient();

async function assignAnkushReelsTask() {
  console.log('🎥 Assigning Reels & Video Production task to Ankush Kumar Thakur...');

  const batch = await prisma.internshipBatch.findFirst({});
  if (!batch) {
    console.error('❌ No active batch found!');
    return;
  }

  const title = '🎥 Certificate & Platform Promotion: Create 5 High-Impact Promotional Reels';
  const description = `# 🎥 Certificate & Platform Promotion: Create 5 High-Impact Promotional Reels

**Role:** Video Editing & Reels Production Intern  
**Assignee:** Ankush Kumar Thakur  
**Reward:** +500 XP  
**Category:** Reels & Video Production  
**Difficulty:** Hard  
**Deadline:** 7 Days from Today  

---

## 📌 Task Objective
Create 5 engaging, high-retention short-form videos (15–45 seconds) for Instagram Reels, YouTube Shorts, and Facebook Reels promoting SARTHI Professional Certificates & Platform Learning Experience.

---

## 📋 Deliverables & Guidelines
1. **5 Promotional Reels (15-45s)**:
   - High-energy hooks in the first 3 seconds.
   - Dynamic captions, clean text overlays, crisp cuts, and trending audio.
   - Feature SARTHI Certificate visuals and course learning interface.
2. **Content Themes**:
   - **Reel 1:** Why Verified Professional Certificates Boost Freshers' Resumes.
   - **Reel 2:** Skill vs Degree — How to Prove Your Mastery to Recruiters.
   - **Reel 3:** SARTHI Certificate Credibility & Instant Access.
   - **Reel 4:** Student Career Transformation & Real-world Project Portfolio.
   - **Reel 5:** Why Independent Certification Matters in 2026.
3. **Call-To-Action (CTA)**:
   - End every video with a clear prompt: *"Enroll now at sarthi-woad.vercel.app"*.
4. **Dashboard Submission**:
   - Upload Google Drive folder link or post URLs on your intern dashboard under this assignment.`;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);

  // 1. Create or Update Assignment in DB
  let assignment = await prisma.internshipAssignment.findFirst({
    where: { batchId: batch.id, title }
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId: batch.id,
        title,
        description,
        category: 'Reels & Video Production',
        difficulty: 'Hard',
        estimatedTime: '8 Hours',
        xpReward: 500,
        deadline,
        mode: 'INDIVIDUAL',
        status: 'active'
      }
    });
    console.log(`✅ Created Database Assignment: ${assignment.id}`);
  } else {
    assignment = await prisma.internshipAssignment.update({
      where: { id: assignment.id },
      data: { description, deadline, status: 'active' }
    });
    console.log(`✅ Updated Database Assignment: ${assignment.id}`);
  }

  // 2. Find Ankush Thakur's batch members
  const ankushEmails = ['ankushkumar1312005@gmail.com', 'ankushkumar94201@gmail.com'];
  
  const allMembers = await prisma.batchMember.findMany({
    include: { user: true }
  });

  const ankushMembers = allMembers.filter(m => 
    ankushEmails.includes(m.user.email.toLowerCase()) || 
    m.user.name?.toLowerCase().includes('ankush thakur')
  );

  console.log(`\nFound ${ankushMembers.length} batch member records for Ankush Thakur:`);
  for (const m of ankushMembers) {
    console.log(` - ${m.user.name} (${m.user.email}) | ID: ${m.id}`);

    // Assign recipient
    await prisma.internshipAssignmentRecipient.upsert({
      where: {
        assignmentId_memberId: {
          assignmentId: assignment.id,
          memberId: m.id
        }
      },
      create: {
        assignmentId: assignment.id,
        memberId: m.id
      },
      update: {}
    });

    // Create submission record
    const existingSub = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: m.id
      }
    });

    if (!existingSub) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: m.id,
          status: 'Assigned'
        }
      });
    }

    console.log(`  ✓ Allocated task live on dashboard for ${m.user.email}`);
  }

  // 3. Send Branded Email Template via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY missing!');
    return;
  }

  const resend = new Resend(resendApiKey);

  for (const email of ankushEmails) {
    const htmlBody = getBrandedTemplate({
      badge: 'REELS & VIDEO PRODUCTION TASK',
      heading: '🎥 Certificate Promotion: Create 5 High-Impact Promotional Reels',
      body: `Hi **Ankush** 👋,

You have been assigned your personalized **Video Editing & Reels Production Sprint** on your SARTHI Intern Dashboard (+500 XP).

### 📌 Task Objective:
Create **5 engaging, high-retention short-form videos (15–45 seconds)** for Instagram Reels, YouTube Shorts, and Facebook Reels promoting SARTHI Professional Certificates & Platform Learning Experience.

### 📋 Key Deliverables & Guidelines:
1. **5 Promotional Reels (15-45s):**
   - High-energy visual hooks in the first 3 seconds.
   - Dynamic captions, clean text overlays, crisp cuts, and trending audio.
   - Feature official certificate visuals and course learning interface.
2. **Content Concepts:**
   - Why Verified Professional Certificates Boost Freshers' Resumes.
   - Skill vs Degree — Proving Your Mastery to Recruiters.
   - SARTHI Certificate Credibility & Instant Access.
   - Student Career Transformation & Real-world Project Portfolio.
3. **Call-To-Action (CTA):** End every video with: *"Enroll now at sarthi-woad.vercel.app"*.
4. **Proof of Work Submission:** Upload your raw video files / Google Drive link / published reel URLs on your intern dashboard under this assignment.`,
      highlight: `💡 **Editing Tip:** Use modern transitions, clear typography, and trending audio to keep viewer retention high across all platforms.`,
      action: {
        label: 'View Assignment in Dashboard',
        url: 'https://sarthi-woad.vercel.app/dashboard/internship'
      },
      senderName: 'Mohit Raj (Lead Architect & Mentor)'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [email],
        subject: `🎥 Task Assignment: Create 5 High-Impact Promotional Reels`,
        html: htmlBody
      });

      if (error) {
        console.error(` ❌ Email failed for ${email}:`, error);
      } else {
        console.log(` ✅ Sent branded reels task email to Ankush (${email}) | Resend ID: ${data?.id}`);
      }
    } catch (e: any) {
      console.error(` ❌ Error sending email to ${email}:`, e.message);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Ankush Thakur Reels Task Allocated on Dashboard & Email Dispatched!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

assignAnkushReelsTask()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
