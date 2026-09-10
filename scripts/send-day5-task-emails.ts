import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('🚀 Sending Day 5 Task emails to Digital Marketing Interns & Prateek Parmar...');

  const dmApps = await prisma.internshipApplication.findMany({
    where: {
      OR: [
        { domain: { contains: 'Digital Marketing' } },
        { trackSlug: { contains: 'digital-marketing' } },
      ]
    }
  });
  const dmEmails = new Set(dmApps.map(a => a.email.toLowerCase()));

  const batch = await prisma.internshipBatch.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      members: {
        include: { user: true }
      }
    }
  });

  if (!batch) {
    console.error('No active batch found');
    return;
  }

  const dmMembers = batch.members.filter(m => {
    const email = (m.user?.email || '').toLowerCase();
    const course = (m.user?.currentCourse || '').toLowerCase();
    return dmEmails.has(email) || course.includes('digital') || course.includes('marketing');
  });

  const prateekMember = batch.members.find(m =>
    (m.user?.name || '').toLowerCase().includes('prateek') ||
    (m.user?.email || '').toLowerCase().includes('prateek')
  );

  let successCount = 0;
  let failCount = 0;

  // 1. Send Day 5 Email to DM Members
  for (const member of dmMembers) {
    const name = member.user.name || 'Intern';
    const email = member.user.email;

    const emailBody = `Hi <strong>${name}</strong> 👋,

<p>A new mandatory task has been assigned to your <strong>SARTHI Internship Dashboard</strong>.</p>

<h3>📅 DAY 5 TASK: Bring 10 Students to Our AI Seminar 🎯</h3>

<p><strong>Task Summary:</strong></p>
<ul>
  <li><strong>Category:</strong> Digital Marketing</li>
  <li><strong>XP Reward:</strong> 500 XP</li>
  <li><strong>Deadline:</strong> Tomorrow • 2:00 PM IST (02 August 2026)</li>
  <li><strong>Seminar Link:</strong> <a href="https://sarthi-woad.vercel.app/seminars/ai-tools-every-student-must-master-2026">sarthi-woad.vercel.app/seminars/ai-tools-every-student-must-master-2026</a></li>
</ul>

<h3>🚀 Your Mission:</h3>
<p>Promote our upcoming flagship seminar across <strong>LinkedIn, Instagram, WhatsApp, Telegram, College Groups, and Discord communities</strong> and bring at least <strong>10 student registrations</strong>.</p>

<h3>🎨 Content You Can Create:</h3>
<ul>
  <li>Promotional Poster</li>
  <li>Instagram Reel or Story Series</li>
  <li>Carousel Post / LinkedIn Post</li>
  <li>Short Promotional Video / Creative Advertisement</li>
</ul>

<h3>📤 Required Dashboard Submissions:</h3>
<ul>
  <li>LinkedIn Post Link</li>
  <li>Instagram Post / Reel Link</li>
  <li>Poster or Reel File / Link</li>
  <li>Screenshots of your promotions</li>
  <li>Number of students you convinced to register</li>
</ul>`;

    const htmlContent = getBrandedTemplate({
      badge: 'INTERNSHIP MANDATORY TASK',
      heading: 'Day 5 Task: Bring 10 Students to AI Seminar',
      body: emailBody,
      action: {
        label: 'Open Internship Dashboard & Submit →',
        url: 'https://sarthi-woad.vercel.app/dashboard/internship'
      },
      senderName: 'SARTHI Management Team'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [email],
        subject: '📢 Mandatory Task Assigned: Day 5 – Bring 10 Students to Our AI Seminar 🎯',
        html: htmlContent
      });

      if (error) {
        console.error(`❌ Resend failed for ${email}:`, error);
        failCount++;
      } else {
        console.log(`✅ Sent Day 5 Email to ${name} (${email}) | MessageID: ${data?.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending email to ${email}:`, err.message);
      failCount++;
    }
  }

  // 2. Send Special Blog Task Email to Prateek
  if (prateekMember) {
    const prateekName = prateekMember.user.name || 'Prateek';
    const prateekEmail = prateekMember.user.email;

    const prateekEmailBody = `Hi <strong>${prateekName}</strong> 👋,

<p>A special Content Writing task has been assigned to your <strong>SARTHI Internship Dashboard</strong>.</p>

<h3>✍️ SPECIAL TASK: Write a Blog Post on AI Tools Seminar 2026 📝</h3>

<p><strong>Task Summary:</strong></p>
<ul>
  <li><strong>Category:</strong> Content Writing &amp; Blogging</li>
  <li><strong>XP Reward:</strong> 450 XP</li>
  <li><strong>Deadline:</strong> Tomorrow • 2:00 PM IST (02 August 2026)</li>
  <li><strong>Seminar Link:</strong> <a href="https://sarthi-woad.vercel.app/seminars/ai-tools-every-student-must-master-2026">sarthi-woad.vercel.app/seminars/ai-tools-every-student-must-master-2026</a></li>
</ul>

<h3>📝 Key Content Highlights to Cover:</h3>
<ol>
  <li><strong>Introduction:</strong> Why AI literacy is mandatory for students in 2026.</li>
  <li><strong>Top AI Tools Covered:</strong> Productive AI tools for research, coding, writing, and design.</li>
  <li><strong>Seminar Value Proposition:</strong> Practical industry insights, live demonstrations, and skill acceleration.</li>
  <li><strong>Call to Action (CTA):</strong> Clear invitation and link encouraging readers to register for the seminar immediately.</li>
</ol>

<h3>📤 Submission Requirements:</h3>
<ul>
  <li>Published Blog Draft / Link on SARTHI Blog Portal</li>
</ul>`;

    const prateekHtml = getBrandedTemplate({
      badge: 'SPECIAL INTERNSHIP TASK',
      heading: 'Blog Writing Task: AI Tools Seminar 2026',
      body: prateekEmailBody,
      action: {
        label: 'Open Internship Dashboard & Submit →',
        url: 'https://sarthi-woad.vercel.app/dashboard/internship'
      },
      senderName: 'SARTHI Management Team'
    });

    try {
      const { data, error } = await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: [prateekEmail],
        subject: '✍️ Special Task Assigned: Write a Comprehensive Blog Post on AI Tools Seminar 2026',
        html: prateekHtml
      });

      if (error) {
        console.error(`❌ Resend failed for Prateek (${prateekEmail}):`, error);
        failCount++;
      } else {
        console.log(`✅ Sent Blog Task Email to Prateek (${prateekEmail}) | MessageID: ${data?.id}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception sending email to Prateek:`, err.message);
      failCount++;
    }
  }

  console.log(`\n🎉 All Email Dispatches Completed! Success: ${successCount}, Failed: ${failCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
