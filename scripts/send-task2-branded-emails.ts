import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const taskBodyMarkdown = `Hi **{NAME}** 👋,

A new mandatory task has been assigned to your **SARTHI Internship Dashboard**.

### 📢 Task 2 – Promote SARTHI on LinkedIn & Instagram (Mandatory)

**Task Summary:**
* **Category:** Mandatory Task
* **Reward:** 300 XP
* **Deadline:** 5 Days from today

---

### What You Need to Do:
1. Visit **sarthi-woad.vercel.app** and explore our programs.
2. Select **any one** program to promote (Internship Program, Certification Exams, Professional Courses, Campus Ambassador Program, or Workshops).
3. Design an **original, minimal, and aesthetic promotional poster**.
4. Write a professional caption in your own words.
5. Publish the poster on:
   - Your **LinkedIn Profile** (Tag **@SARTHI**)
   - Your **Instagram Account** (Tag **@sarthi-woad.vercel.app**)
6. Mention **https://sarthi-woad.vercel.app** in your caption to encourage visits.

---

### Required Submissions on Dashboard:
- ✅ LinkedIn Post Link
- ✅ Instagram Post Link
- ✅ Canva/Figma Design Link
- ✅ Final Poster (PNG/PDF)`;

async function resendBrandedTaskEmails() {
  const activeMembers = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true }
  });

  console.log(`Sending OFFICIAL BRANDED Task 2 emails to ${activeMembers.length} active interns...`);

  let successCount = 0;
  let failCount = 0;

  for (const member of activeMembers) {
    const internName = member.user.name || 'Intern';
    const personalizedBody = taskBodyMarkdown.replace('{NAME}', internName);

    const htmlContent = getBrandedTemplate({
      badge: 'INTERNSHIP MANDATORY TASK',
      heading: 'Task 2: Promote SARTHI on Social Media',
      body: personalizedBody,
      highlight: '📌 **Important:** This task is mandatory for earning your internship completion certificate and batch points. Submissions close in 5 days!',
      action: {
        label: 'Go to Internship Dashboard & Submit →',
        url: 'https://sarthi-woad.vercel.app/dashboard'
      },
      senderName: 'SARTHI Team'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [member.user.email],
        subject: `📢 Mandatory Task Assigned: Task 2 – Promote SARTHI on LinkedIn & Instagram`,
        html: htmlContent
      });

      if (error) {
        console.error(`❌ Resend failed for ${member.user.email}:`, error);
        failCount++;
      } else {
        console.log(`✅ Official Branded Email sent to ${internName} (${member.user.email}) | ID: ${data?.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending to ${member.user.email}:`, err.message);
      failCount++;
    }
  }

  console.log(`\n🎉 Branded Email Sending Finished! Sent: ${successCount}, Failed: ${failCount}`);
}

resendBrandedTaskEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
