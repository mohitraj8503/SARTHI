import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const day4TaskTitle = '📅 Day 4 Task – Create a Reel Promoting the SARTHI Student Ambassador Program 🎥';

const day4MarkdownDescription = `### 📅 Day 4 Task – Create a Reel Promoting the SARTHI Student Ambassador Program 🎥

**Overview:**
Create a short promotional reel (20–45 seconds) encouraging students to apply for the official SARTHI Student Ambassador Program.

---

### 📌 Task Details & Requirements:
- **Duration:** 20–45 seconds
- **Format:** Vertical (9:16)
- **Resolution:** 1080 × 1920
- **Platform:** Instagram Reels & LinkedIn Video
- **Deadline:** 31 July 2026 • 9:00 PM IST

---

### 📝 What Your Reel Should Cover:
1. **Who can apply:** Open to all undergraduate & postgraduate students.
2. **How to apply & Selection Process:**
   - Online Application
   - Profile Review & Virtual Interview
   - Onboarding & Training
   - Official Ambassador
3. **Benefits:** Experience Certificate, Letter of Recommendation (LOR), Digital Badge, Free Learning Opportunities, Networking, Leadership Experience, Exclusive Rewards.
4. **Call to Action:** "Apply Now at https://sarthi-woad.vercel.app/student-ambassadors"

---

### 📲 Upload & Tagging Guidelines:
- **LinkedIn:** Upload vertical video, tag **@SARTHI**, write a short caption.
- **Instagram:** Upload vertical reel, tag **@sarthi-woad.vercel.app**, mention website link in caption.

---

### 📝 Required Dashboard Submissions:
- ✅ Instagram Reel Link
- ✅ LinkedIn Video Link
- ✅ Canva / CapCut / Premiere / Figma Project Link`;

async function main() {
  const shouldSendEmail = process.argv.includes('--send-email');
  console.log(`🚀 Starting Day 4 Task Assignment (Send Email Mode: ${shouldSendEmail})...`);

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
  // Deadline: 31 July 2026 9:00 PM IST
  const deadlineDate = new Date('2026-07-31T21:00:00+05:30');

  // 1. Create or get Day 4 Assignment
  let assignment = await prisma.internshipAssignment.findFirst({
    where: {
      batchId,
      title: day4TaskTitle,
    }
  });

  if (!assignment) {
    assignment = await prisma.internshipAssignment.create({
      data: {
        batchId,
        title: day4TaskTitle,
        description: day4MarkdownDescription,
        difficulty: 'Medium',
        estimatedTime: '2 Hours',
        xpReward: 400,
        deadline: deadlineDate,
        mode: 'INDIVIDUAL'
      }
    });
    console.log(`✅ Created Database Assignment Day 4 (ID: ${assignment.id})`);
  } else {
    console.log(`ℹ️ Assignment Day 4 already exists in DB (ID: ${assignment.id})`);
  }

  let dbAssignedCount = 0;
  let emailSuccessCount = 0;
  let emailFailCount = 0;

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

    dbAssignedCount++;

    if (shouldSendEmail) {
      const emailBody = `Hi <strong>${internName}</strong> 👋,

<p>A new mandatory task has been assigned to your <strong>SARTHI Internship Dashboard</strong>.</p>

<h3>📅 Day 4 Task: Create a Reel Promoting the SARTHI Student Ambassador Program 🎥</h3>

<p><strong>Task Summary:</strong></p>
<ul>
  <li><strong>Category:</strong> Mandatory Daily Task</li>
  <li><strong>Reward:</strong> 400 XP</li>
  <li><strong>Deadline:</strong> 31 July 2026 at 9:00 PM IST</li>
  <li><strong>Program Link:</strong> <a href="https://sarthi-woad.vercel.app/student-ambassadors">sarthi-woad.vercel.app/student-ambassadors</a></li>
</ul>

<h3>📹 Reel Requirements:</h3>
<ul>
  <li><strong>Duration:</strong> 20–45 seconds</li>
  <li><strong>Format:</strong> Vertical (9:16)</li>
  <li><strong>Resolution:</strong> 1080 &times; 1920</li>
  <li><strong>Platform:</strong> Instagram Reels &amp; LinkedIn Video</li>
</ul>

<h3>📝 What Your Reel Should Cover:</h3>
<ol>
  <li><strong>Who can apply:</strong> Open to all undergraduate &amp; postgraduate students.</li>
  <li><strong>How to apply &amp; Selection Process:</strong> Online Application &rarr; Profile Review &amp; Virtual Interview &rarr; Onboarding &rarr; Official Ambassador.</li>
  <li><strong>Benefits:</strong> Experience Certificate, Letter of Recommendation (LOR), Digital Badge, Free Learning Opportunities, Networking, Leadership Experience, Exclusive Rewards.</li>
  <li><strong>Call to Action:</strong> <em>"Apply Now at https://sarthi-woad.vercel.app/student-ambassadors"</em></li>
</ol>

<h3>📲 Upload &amp; Tagging Guidelines:</h3>
<ul>
  <li><strong>LinkedIn:</strong> Upload vertical video, tag <strong>@SARTHI</strong>, write a short caption.</li>
  <li><strong>Instagram:</strong> Upload vertical reel, tag <strong>@sarthi-woad.vercel.app</strong>, mention website link in caption.</li>
</ul>

<h3>📝 Required Dashboard Submissions:</h3>
<ul>
  <li>Instagram Reel Link</li>
  <li>LinkedIn Video Link</li>
  <li>Canva / CapCut / Premiere / Figma Project Link</li>
</ul>`;

      const htmlContent = getBrandedTemplate({
        badge: 'INTERNSHIP MANDATORY TASK',
        heading: 'Day 4 Task: Create Ambassador Program Reel',
        body: emailBody,
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
          subject: `📢 Mandatory Task Assigned: Day 4 – Create a Reel Promoting SARTHI Student Ambassador Program`,
          html: htmlContent
        });

        if (error) {
          console.error(`❌ Resend failed for ${email}:`, error);
          emailFailCount++;
        } else {
          console.log(`✅ Branded Email sent to ${internName} (${email}) | ID: ${data?.id}`);
          emailSuccessCount++;
        }
      } catch (err: any) {
        console.error(`❌ Exception sending email to ${email}:`, err.message);
        emailFailCount++;
      }
    }
  }

  console.log(`\n🎉 Day 4 Task Assignment Done! DB Assigned: ${dbAssignedCount} members.`);
  if (shouldSendEmail) {
    console.log(`Emails Sent: Success=${emailSuccessCount}, Failed=${emailFailCount}`);
  } else {
    console.log(`Note: Email dispatch was skipped because --send-email flag was not passed.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
