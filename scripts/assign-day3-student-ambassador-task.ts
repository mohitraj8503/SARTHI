import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const day3TaskTitle = '📅 Day 3 Task – Promote the SARTHI Student Ambassador Program';

const day3MarkdownDescription = `### 📅 Day 3 Task – Promote the SARTHI Student Ambassador Program

**Overview:**
Learn about and promote the official SARTHI Student Ambassador Program across LinkedIn and Instagram.

---

### 📌 Step-by-Step Instructions:

#### Step 1: Learn About the Program
Visit and read the details on **https://sarthi-woad.vercel.app/student-ambassadors**:
- What the Student Ambassador Program is
- Who can apply & How to join
- Benefits (Certificate, Leadership, Networking, Community) & Responsibilities

#### Step 2: Create 1 Original Promotional Poster
Your poster MUST include:
- Official SARTHI Logo *(Download official logo directly below)*:
  - 📥 **High-Res Logo (PNG):** [https://sarthi-woad.vercel.app/sarthi-logo.png](https://sarthi-woad.vercel.app/sarthi-logo.png)
  - 📥 **Transparent Logo (PNG):** [https://sarthi-woad.vercel.app/sarthi-logo.png](https://sarthi-woad.vercel.app/sarthi-logo.png)
- Title: "Student Ambassador Program"
- Notice: "Applications Open"
- Key Benefits (Certificate, Leadership, Networking, Community)
- Website URL: **sarthi-woad.vercel.app/student-ambassadors**
*(Clean, minimal, premium, mobile-friendly design required. No copying from Google.)*

#### Step 3: Post on LinkedIn
- Explain what the Student Ambassador Program is.
- Encourage students to apply.
- Include website URL: **https://sarthi-woad.vercel.app/student-ambassadors**
- Tag **@SARTHI** on LinkedIn.

#### Step 4: Post on Instagram
- Explain why students should become a Student Ambassador.
- Include website URL: **https://sarthi-woad.vercel.app/student-ambassadors**
- Tag **@sarthi-woad.vercel.app** on Instagram.

---

### 📝 Required Dashboard Submissions:
- ✅ LinkedIn Post Link
- ✅ Instagram Post Link
- ✅ Canva/Adobe Express/Figma Design Link`;

async function main() {
  console.log('🚀 Starting Day 3 Task Assignment & Email Dispatch...');

  const activeMembers = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: true,
      batch: true,
      submissions: {
        include: {
          assignment: true,
          versions: true,
        }
      }
    }
  });

  console.log(`Found ${activeMembers.length} active intern batch members.`);

  if (activeMembers.length === 0) {
    console.log('No active members found.');
    return;
  }

  const batchId = activeMembers[0].batchId;
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 3);

  // 1. Create or get Day 3 Assignment
  let assignment = await prisma.internshipAssignment.findFirst({
    where: {
      batchId,
      title: day3TaskTitle,
    }
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId,
        title: day3TaskTitle,
        description: day3MarkdownDescription,
        difficulty: 'Medium',
        estimatedTime: '2 Hours',
        xpReward: 300,
        deadline: deadlineDate,
        mode: 'INDIVIDUAL'
      }
    });
    console.log(`✅ Created Database Assignment Day 3 (ID: ${assignment.id})`);
  } else {
    console.log(`ℹ️ Assignment Day 3 already exists in DB (ID: ${assignment.id})`);
  }

  let successCount = 0;
  let failCount = 0;

  for (const member of activeMembers) {
    const internName = member.user.name || 'Intern';
    const email = member.user.email;

    // Link Recipient
    const recipient = await prisma.internshipAssignmentRecipient.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id
      }
    });
    if (!recipient) {
      await prisma.internshipAssignmentRecipient.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id
        }
      });
    }

    // Link Submission
    const submission = await prisma.internshipSubmission.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id
      }
    });
    if (!submission) {
      await prisma.internshipSubmission.create({
        data: {
          assignmentId: assignment.id,
          memberId: member.id,
          status: 'Assigned'
        }
      });
    }

    // Check Task 2 completion status
    const task2Submission = member.submissions.find(s => 
      s.assignment.title.includes('Task 2') || s.assignment.title.includes('Social Media')
    );
    const hasCompletedTask2 = task2Submission && (task2Submission.status === 'Approved' || task2Submission.versions.length > 0);

    let warningCallout = '';
    if (!hasCompletedTask2) {
      warningCallout = `⚠️ **STRICT WARNING / NOTICE OF PENDING SUSPENSION:**\nOur system indicates that you have **NOT** submitted **Task 2 (Promote SARTHI on Social Media)**. Under SARTHI's strict internship compliance guidelines, failing to submit mandatory tasks within deadlines leads to immediate **Internship Suspension, revocation of batch points, and forfeiture of the Internship Completion Certificate**. Please complete and submit Task 2 along with Day 3 Task immediately to avoid termination of your internship program.`;
    } else {
      warningCallout = `✨ **Task 2 Status:** Verified & Submitted! Keep up the great work. Please complete Day 3 Task on time to maintain your top rank on the batch leaderboard.`;
    }

    const emailBody = `Hi **${internName}** 👋,

A new mandatory task has been assigned to your **SARTHI Internship Dashboard**.

### 📅 Day 3 Task – Promote the SARTHI Student Ambassador Program

**Task Summary:**
* **Category:** Mandatory Daily Task
* **Reward:** 300 XP
* **Deadline:** 3 Days from today
* **Official Web Page:** [https://sarthi-woad.vercel.app/student-ambassadors](https://sarthi-woad.vercel.app/student-ambassadors)

---

### What You Need to Do:
1. **Understand the Program:** Read details on [sarthi-woad.vercel.app/student-ambassadors](https://sarthi-woad.vercel.app/student-ambassadors) (Who can apply, Benefits, Responsibilities).
2. **Create 1 Original Promotional Poster:** Must include SARTHI Logo (Download from [High-Res PNG](https://sarthi-woad.vercel.app/sarthi-logo.png) or [Transparent PNG](https://sarthi-woad.vercel.app/sarthi-logo.png)), "Student Ambassador Program", "Applications Open", Main Benefits, and Website URL (\`sarthi-woad.vercel.app/student-ambassadors\`). Clean, minimal & premium design.
3. **Post on LinkedIn:** Explain the program, encourage students to apply, include the link, and tag **@SARTHI**.
4. **Post on Instagram:** Share why students should join, include the link, and tag **@sarthi-woad.vercel.app**.
5. **Submit on Dashboard:** Submit your LinkedIn link, Instagram link, and Canva/Design link.

---

### Submission Requirements:
- ✅ LinkedIn Post Link
- ✅ Instagram Post Link
- ✅ Canva / Adobe Express / Figma Design Link`;

    const htmlContent = getBrandedTemplate({
      badge: 'INTERNSHIP MANDATORY TASK',
      heading: 'Day 3 Task: Promote Student Ambassador Program',
      body: emailBody,
      highlight: warningCallout,
      action: {
        label: 'Open Internship Dashboard & Submit →',
        url: 'https://sarthi-woad.vercel.app/dashboard'
      },
      senderName: 'SARTHI Management Team'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [email],
        subject: `📢 Mandatory Task Assigned: Day 3 – Promote SARTHI Student Ambassador Program`,
        html: htmlContent
      });

      if (error) {
        console.error(`❌ Resend failed for ${email}:`, error);
        failCount++;
      } else {
        console.log(`✅ Branded Email sent to ${internName} (${email}) | Status: ${hasCompletedTask2 ? 'Submitted Task2' : 'WARNED (Missing Task2)'} | ID: ${data?.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending email to ${email}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Day 3 Assignment & Email Dispatch Completed! Success: ${successCount}, Failed: ${failCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
