import 'dotenv/config';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { getBrandedTemplate } from '@/lib/email/templates/branded';

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY missing in .env');

  const resend = new Resend(apiKey);
  const recipientEmail = 'mukulonthenet@gmail.com';
  const recipientName = 'Mukul Pandey';
  const subject = '🚀 High-Priority Assignment: Campus Ambassador Program Promotion & Reel Campaign — SARTHI';

  console.log(`Sending Campaign email to Mukul Pandey <${recipientEmail}>...`);

  const html = getBrandedTemplate({
    badge: '🎯 MISSION: SOCIAL MEDIA & GROWTH',
    heading: 'Campus Ambassador Program Promotion & Instagram Reel Challenge',
    body: `Dear **${recipientName}**,

As part of your core **Digital Marketing & Growth Internship** at **SARTHI**, you are assigned a high-priority outreach campaign to promote our flagship **Campus Ambassador Program** (https://sarthi-woad.vercel.app/student-ambassadors).

### 🌟 Why Campus Ambassadors Matter (Program Importance):
• **Student Leadership & Network:** Campus Ambassadors represent SARTHI across top colleges and universities across India, driving tech communities, webinars, and cohort registrations.
• **High Organic Trust:** Word-of-mouth and student creator reels create 5x higher engagement and authentic reach than traditional ads.
• **Exclusive Ambassador Perks:** Official Leadership Certificate, Letter of Recommendation (LOR), performance stipends/cash rewards, exclusive swag, and priority internship placements.

### 🎬 Your Deliverables & Action Items:
1. **Create an Engaging Instagram Reel (30–60 Seconds):**
   - **Hook Idea:** *"Want to lead your college tech community and earn exciting perks?"* or *"How to become a SARTHI Campus Ambassador in 2026!"*
   - Explain key perks (Certificate, LOR, Cash Rewards, Swag, Mentorship).
   - **Call-to-Action:** *"Apply now at sarthi-woad.vercel.app/student-ambassadors or click the link in bio!"*
2. **Social Media & WhatsApp Outreach:**
   - Share the program link across college WhatsApp groups, LinkedIn, and Instagram stories.
3. **Submission:**
   - Upload your Reel video link (Instagram/Drive) and outreach proof on your Internship Dashboard or in reply to this email by **Friday, 4 September 2026**.`,
    highlight: `🌟 **Campaign Goal:** Drive maximum student awareness and applications for the SARTHI Campus Ambassador program across your college network!`,
    action: {
      label: 'View Program Details & Apply',
      url: 'https://sarthi-woad.vercel.app/student-ambassadors'
    },
    senderName: 'SARTHI Mentorship & Growth Team'
  });

  const res = await resend.emails.send({
    from: 'SARTHI <noreply@sarthi-woad.vercel.app>',
    replyTo: 'pm.enthuse@gmail.com',
    to: recipientEmail,
    subject,
    html
  });

  console.log('Result for Mukul Pandey:', res);

  await prisma.auditLog.create({
    data: {
      actorId: 'mohitraj8503',
      actorEmail: 'admin@sarthi.in',
      action: 'MARKETING_TASK_ASSIGNED_EMAIL_SENT',
      entityType: 'InternTask',
      entityId: recipientEmail,
      entityName: recipientName,
      newValues: JSON.stringify({
        recipientEmail,
        subject,
        task: 'Campus Ambassador Promotion & Reel Campaign',
        sentAt: new Date()
      }),
      reason: `Campus Ambassador marketing campaign task email sent to ${recipientEmail}`
    }
  }).catch(e => console.warn('AuditLog error:', e.message));

  console.log('\nEmail successfully delivered to Mukul Pandey!');
  await prisma.$disconnect();
}

main().catch(console.error);
