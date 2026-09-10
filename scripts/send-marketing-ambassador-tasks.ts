import 'dotenv/config';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { getBrandedTemplate } from '@/lib/email/templates/branded';

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY missing in .env');

  const resend = new Resend(apiKey);

  console.log('--- Step 1: Dispatching Suspension Upliftment Task Emails to Surjo & Ankush ---');

  const suspendedRecipients = [
    {
      name: 'Surjo Banerjee',
      email: 'surjobanerjee207@gmail.com',
      internId: 'TTI000060'
    },
    {
      name: 'Ankush Kumar Thakur',
      email: 'ankushkumar94201@gmail.com',
      altEmail: 'ankushkumar1312005@gmail.com',
      internId: 'TT-STU-0174'
    }
  ];

  for (const intern of suspendedRecipients) {
    const subject = '⚠️ Action Required: Mandatory Task for Internship Suspension Upliftment — SARTHI';
    const html = getBrandedTemplate({
      badge: '⚠️ SUSPENSION UPLIFTMENT CHALLENGE',
      heading: 'Mandatory Campus Ambassador Promotion Reel: Suspension Upliftment Assignment',
      body: `Dear **${intern.name}**,

Your internship account is currently on **SUSPENDED** status due to inactivity / review.

To officially **uplift your suspension** and restore your active internship standing and completion eligibility, you are assigned this **Mandatory Video Editing & Reels Campaign**:

### 🎬 Required Task Deliverables:
1. **High-Retention Campus Ambassador Reel (30–60 Seconds):**
   - Produce a high-quality, engaging Instagram Reel promoting the **SARTHI Campus Ambassador Program** (https://sarthi-woad.vercel.app/student-ambassadors).
   - **Key Highlights to Include:** Student Leadership Role, Official Certificate of Leadership, Letter of Recommendation (LOR), Performance Cash Stipends, Exclusive Tech Swag, and Free Masterclasses.
   - **Visuals & Audio:** Dynamic transitions, clear voiceover/subtitles, engaging B-roll, and strong Call-to-Action (*"Apply now at sarthi-woad.vercel.app/student-ambassadors"*).
2. **Submission Deadline:** **Wednesday, 2 September 2026, 11:59 PM**.
3. **Review & Upliftment Process:** Send your Google Drive video link / Instagram post link in reply to this email. Upon satisfactory review by the mentorship team, your suspension will be immediately revoked and your active status restored.`,
      highlight: `⚡ **Action Required:** Complete and submit your Campus Ambassador promotion reel before the deadline to restore your internship standing.`,
      action: {
        label: 'Review Program Details & Assets',
        url: 'https://sarthi-woad.vercel.app/student-ambassadors'
      },
      senderName: 'SARTHI Mentorship & Operations Team'
    });

    const toList = [intern.email];
    if ((intern as any).altEmail) toList.push((intern as any).altEmail);

    const res = await resend.emails.send({
      from: 'SARTHI <noreply@sarthi-woad.vercel.app>',
      replyTo: 'pm.enthuse@gmail.com',
      to: toList,
      subject,
      html
    });

    console.log(`Dispatched Suspension Upliftment email to ${intern.name}:`, res);

    await prisma.auditLog.create({
      data: {
        actorId: 'mohitraj8503',
        actorEmail: 'admin@sarthi.in',
        action: 'SUSPENSION_UPLIFT_TASK_SENT',
        entityType: 'InternTask',
        entityId: intern.internId,
        entityName: intern.name,
        newValues: JSON.stringify({
          recipientEmail: toList,
          subject,
          task: 'Campus Ambassador Promotion Reel',
          sentAt: new Date()
        }),
        reason: `Mandatory suspension upliftment task email sent to ${intern.name}`
      }
    }).catch(e => console.warn('AuditLog error:', e.message));
  }

  console.log('\n--- Step 2: Dispatching Regular Campaign Emails to Digital Marketing Interns ---');

  const regularMarketingInterns = [
    { name: 'Jaanvi Nair', email: 'nairjaanvi199@gmail.com' },
    { name: 'Nandini Katiyar', email: 'nandinikatiyar5@gmail.com' },
    { name: 'Aniket Dutta', email: 'aniketdutta615@gmail.com' },
    { name: 'Kumari Tejal', email: 'kumaritejal535@gmail.com' },
    { name: 'Srinivas Singh Deo', email: 'srinivasdeo02@gmail.com' },
    { name: 'Ranjan Singh', email: 'ranjansinghgy@gmail.com' },
    { name: 'Safia Manzoor', email: 'wsafia2005@gmail.com' },
    { name: 'Neha Kumari', email: 'aspirantneha28@gmail.com' },
    { name: 'Ayush Kumar', email: 'meayushkumar1506@gmail.com' },
    { name: 'Priyanshu Thakur', email: 'tkpansh@gmail.com' },
    { name: 'Gayathri Raja', email: 'gayathriraja714@gmail.com' },
    { name: 'Rishika Singh', email: 'rishikasingh711@gmail.com' },
    { name: 'Sayani Ghosh', email: 'ghoshsayani4444@gmail.com' },
    { name: 'Somya Gaur', email: 'somyagaur909@gmail.com' },
    { name: 'Aishwarya Hiremath', email: 'aishuh07@gmail.com' }
  ];

  for (const intern of regularMarketingInterns) {
    const subject = '🚀 High-Priority Assignment: Campus Ambassador Program Promotion & Reel Campaign — SARTHI';
    const html = getBrandedTemplate({
      badge: '🎯 MISSION: SOCIAL MEDIA & GROWTH',
      heading: 'Campus Ambassador Program Promotion & Instagram Reel Challenge',
      body: `Dear **${intern.name}**,

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
      to: intern.email,
      subject,
      html
    });

    console.log(`Dispatched Campaign email to ${intern.name} (${intern.email}):`, res);

    await prisma.auditLog.create({
      data: {
        actorId: 'mohitraj8503',
        actorEmail: 'admin@sarthi.in',
        action: 'MARKETING_TASK_ASSIGNED_EMAIL_SENT',
        entityType: 'InternTask',
        entityId: intern.email,
        entityName: intern.name,
        newValues: JSON.stringify({
          recipientEmail: intern.email,
          subject,
          task: 'Campus Ambassador Promotion & Reel Campaign',
          sentAt: new Date()
        }),
        reason: `Campus Ambassador marketing campaign task email sent to ${intern.name}`
      }
    }).catch(e => console.warn('AuditLog error:', e.message));
  }

  console.log('\nAll campaign and suspension upliftment task emails have been successfully dispatched!');
  await prisma.$disconnect();
}

main().catch(console.error);
