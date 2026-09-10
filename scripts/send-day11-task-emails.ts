import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';
require('dotenv').config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || '');

// List of Digital Marketing interns to send the email to
const DIGITAL_MARKETING_INTERNS = [
  { name: 'Ashek Ali Shah', email: 'ashekalishah99@gmail.com' },
  { name: 'Divya', email: 'divyadoc56@gmail.com' },
  { name: 'Srinivas Singh Deo', email: 'srinivasdeo02@gmail.com' },
  { name: 'Ranjan Singh', email: 'ranjansinghgy@gmail.com' },
  { name: 'Vivek Sharma', email: 'viveksharma8364@gmail.com' },
  { name: 'Jaanvi Nair', email: 'nairjaanvi199@gmail.com' },
  { name: 'Harsh Ubale', email: 'ubaleharsh21@gmail.com' },
  { name: 'Kasim Rasool', email: 'kasimrasoolfusion@gmail.com' },
  { name: 'Vigneshwaran B', email: 'vxnverse7@gmail.com' },
  { name: 'Mohd Zaid', email: 'zaidsiddiqui4733@gmail.com' },
  { name: 'Nandini Katiyar', email: 'nandinikatiyar5@gmail.com' },
  { name: 'Ritesh Kumar', email: '85ritesh@gmail.com' }
];

async function main() {
  console.log(`\n==================================================`);
  console.log(`📧 SENDING DAY 11 BRANDED EMAILS TO DIGITAL MARKETING INTERNS`);
  console.log(`==================================================\n`);

  let sent = 0;
  let failed = 0;

  for (const intern of DIGITAL_MARKETING_INTERNS) {
    const firstName = intern.name.trim().split(' ')[0];

    const markdownBody = `Dear ${firstName},

Today's task is exclusively for the **Digital Marketing & Social Media** Interns.

Your goal is to create a genuine, engaging face-to-camera video sharing your experience as a SARTHI intern.

### 🎥 Video Format & Language
- **Language:** Hindi, English, or Hinglish
- **Format:** Must be a **Face Video** (Voice-over, slideshow, AI avatar, or faceless video will not be accepted).
- **Duration:** 30–60 seconds

### 🗣️ What to Talk About
- Why you joined SARTHI
- What you have worked on so far
- What you have learned
- Your experience with the internship
- How the team and work environment have been
- One thing you genuinely liked
- One skill you improved
- Why other students should consider joining SARTHI

*Keep it natural. Do not read a heavily scripted advertisement.*

### 📲 Publishing & Tagging
- Upload the video as a Reel on your Instagram account.
- Mention/tag **@sarthi** in the post.
- Use relevant internship and skill-development hashtags.

### 📦 Submission Requirements
Submit your work on your **SARTHI Student Dashboard** with:
1. Instagram Reel link
2. Screenshot of the published Reel
3. Brief note about what you learned from creating it

### ⚠️ Important Note
This is a personal-branding and marketing task. Your video should feel authentic, confident, and professional. Speak from your actual experience.

⏰ **Deadline: Today • 9:00 PM IST**`;

    const html = getBrandedTemplate({
      badge: 'INTERNSHIP TASK · DAY 11',
      heading: 'Day 11 Task — Internship Journey Face Video 🎥',
      body: markdownBody,
      action: {
        label: 'Open Student Dashboard',
        url: 'https://sarthi-woad.vercel.app/dashboard'
      },
      senderName: 'Team SARTHI'
    });

    try {
      await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: intern.email.trim().toLowerCase(),
        subject: 'Day 11 Task — Internship Journey Face Video 🎥',
        html
      });
      console.log(`✅ Sent email to ${intern.name} (${intern.email})`);
      sent++;
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Failed for ${intern.name} (${intern.email}):`, err);
      failed++;
    }
  }

  console.log(`\n📊 Email Summary — Sent: ${sent}, Failed: ${failed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
