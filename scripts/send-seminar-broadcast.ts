import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/email/send';
import { getBrandedTemplate } from '../lib/email/templates/branded';

async function sendBroadcast() {
  console.log('🚀 Starting Seminar Broadcast Dispatch...');

  // 1. Collect Recipient Emails
  const internApps = await prisma.internshipApplication.findMany({
    where: { status: { in: ['accepted', 'OFFER_ACCEPTED', 'APPROVED', 'approved', 'ACTIVE', 'active'] } },
    select: { email: true, name: true }
  });

  const teachers = await prisma.user.findMany({
    where: { role: { in: ['TEACHER', 'INSTRUCTOR', 'MENTOR'] } },
    select: { email: true, name: true }
  });

  const activeUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: { email: true, name: true }
  });

  const recipientMap = new Map<string, string>(); // email -> name

  // Add interns
  internApps.forEach(app => {
    if (app.email) recipientMap.set(app.email.toLowerCase().trim(), app.name || 'Student');
  });

  // Add teachers
  teachers.forEach(t => {
    if (t.email) recipientMap.set(t.email.toLowerCase().trim(), t.name || 'Instructor');
  });

  // Add active users
  activeUsers.forEach(u => {
    if (u.email) recipientMap.set(u.email.toLowerCase().trim(), u.name || 'User');
  });

  // Add explicit requested recipient
  recipientMap.set('utkarsh9875@hotmail.com', 'Utkarsh');

  console.log(`📋 Total Unique Recipients: ${recipientMap.size}`);

  let sentCount = 0;
  let failCount = 0;

  const meetingUrl = 'https://meet.google.com/sej-dpbu-fki';
  const seminarTitle = 'AI Tools Every Student Must Master in 2026 🚀';

  for (const [email, name] of recipientMap.entries()) {
    try {
      const html = getBrandedTemplate({
        badge: 'LIVE MASTERCLASS TODAY @ 8:00 PM',
        heading: `Live Today: ${seminarTitle}`,
        body: `Hi **${name}**,

Join us **TODAY at 8:00 PM IST** for an exclusive live masterclass on **${seminarTitle}**!

In this live session, you will learn how to leverage ChatGPT, Claude, Gemini, Cursor AI, Canva AI, Notion AI, and GitHub Copilot to boost your productivity, build top-tier projects, and stand out to recruiters in 2026.

We look forward to seeing you at the live session!`,
        highlight: `📅 **Session Time**: Today (Sunday, 9 Aug 2026) @ 8:00 PM IST\n\n📍 **Joining Link**: ${meetingUrl}`,
        action: {
          label: 'Join Live Masterclass Now',
          url: meetingUrl
        },
        senderName: 'SARTHI Team'
      });

      await sendTransactionalEmail({
        to: email,
        type: 'notification',
        subject: `🚨 LIVE Today @ 8:00 PM: AI Tools Every Student Must Master in 2026`,
        html,
        provider: 'resend'
      });

      sentCount++;
      console.log(`[${sentCount}/${recipientMap.size}] ✅ Sent to: ${email}`);
    } catch (err: any) {
      failCount++;
      console.error(`❌ Failed to send to ${email}:`, err?.message || err);
    }
  }

  console.log('\n==================================================');
  console.log(`🎉 Broadcast Summary:`);
  console.log(`   - Total Sent Successfully: ${sentCount}`);
  console.log(`   - Failures: ${failCount}`);
  console.log('==================================================');

  await prisma.$disconnect();
}

sendBroadcast().catch(console.error);
