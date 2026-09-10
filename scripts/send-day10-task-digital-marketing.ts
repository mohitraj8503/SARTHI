import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  // Fetch only Digital Marketing interns
  const interns = await prisma.internshipApplication.findMany({
    where: {
      status: 'OFFER_ACCEPTED',
      domain: { contains: 'Digital Marketing' }
    },
    select: { name: true, email: true, domain: true }
  });

  console.log(`Found ${interns.length} Digital Marketing interns.`);

  let sent = 0;
  let failed = 0;

  for (const intern of interns) {
    const firstName = intern.name.trim().split(' ')[0];

    const emailBody = `Dear ${firstName},

Today's task is to **explore and promote the SARTHI Scale-Ready Projects.**

## 📈 Your Mission — Digital Marketing

Promote our Industry Automation Projects across:
- LinkedIn
- Instagram
- WhatsApp
- Student communities
- Developer communities

Create either a **Reel, carousel, or promotional campaign** explaining the practical value of one project from **sarthi-woad.vercel.app/industry-automation**

Focus on **reach, engagement, and genuine interest** — not just posting.

## What to explain in your content

- What the project does
- What problem it solves
- How it can be used in the real world
- Who can benefit from it
- Technologies used
- Why such automation matters for businesses

## Suggested angle

*"How Industry-Ready Automation Is Changing the Way Businesses Work"*

Use an actual SARTHI project as the example.

## 📤 Submit

- Final content (Reel / Carousel / Campaign)
- Live links
- Screenshots
- Short explanation of the project you selected

Use **SARTHI branding** throughout your work.

⏰ **Deadline: Today · 9:00 PM IST**

Don't just promote a project. **Show people why it matters.**`;

    const html = getBrandedTemplate({
      badge: 'INTERNSHIP TASK · DAY 10',
      heading: 'Day 10 Task — Promote SARTHI Industry-Ready Projects',
      body: emailBody,
      action: {
        label: 'Explore Industry Projects',
        url: 'https://sarthi-woad.vercel.app/industry-automation'
      },
      senderName: 'Team SARTHI'
    });

    try {
      await resend.emails.send({
        from: 'SARTHI <admin@sarthi.in>',
        to: intern.email.trim().toLowerCase(),
        subject: 'Day 10 Task — Promote SARTHI Industry-Ready Projects',
        html
      });
      console.log(`✅ Sent to ${intern.name} (${intern.email})`);
      sent++;

      // Rate limit: Resend allows 10/sec, add small delay
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ Failed for ${intern.name} (${intern.email}):`, err);
      failed++;
    }
  }

  console.log(`\n📊 Done — Sent: ${sent}, Failed: ${failed}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
