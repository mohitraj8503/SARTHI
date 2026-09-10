import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';

const prisma = new PrismaClient();

async function main() {
  const email = 'ashishsay133@gmail.com';
  const certificationId = 'python-professional-developer';

  console.log(`--- Unlocking Python Certification for ${email} ---`);

  // 1. Fetch user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User with email ${email} not found.`);
  }

  // 2. Fetch certification
  const certification = await prisma.certification.findUnique({ where: { id: certificationId } });
  if (!certification) {
    throw new Error(`Certification ${certificationId} not found.`);
  }

  // 3. Upsert certification registration
  const registration = await prisma.certificationRegistration.upsert({
    where: {
      certificationId_userId: {
        certificationId,
        userId: user.id
      }
    },
    update: {
      status: 'REGISTERED',
      amount: Number(certification.price || 0)
    },
    create: {
      userId: user.id,
      certificationId,
      status: 'REGISTERED',
      amount: Number(certification.price || 0)
    }
  });

  console.log('✅ Certification Registration Created/Updated:', registration.id);

  // 4. Send Confirmation Email via Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not defined in environment variables.');
  }

  const resend = new Resend(apiKey);
  const emailFrom = process.env.EMAIL_FROM || 'admin@sarthi.in';

  console.log(`📡 Dispatching email via Resend to ${email} (from ${emailFrom})...`);

  const emailHtml = getBrandedTemplate({
    badge: 'Certification Unlocked',
    heading: 'Python Professional Developer Certification Unlocked!',
    body: `Hello ${user.name || 'Student'},\n\nCongratulations! Your Python Professional Developer Certification has been successfully unlocked on your account.\n\nYou can now log in to your dashboard and attempt the certification exam at your convenience.\n\nGood luck!`,
    action: {
      label: 'Start Certification Exam',
      url: 'https://sarthi-woad.vercel.app/certification-exams/python-professional'
    },
    senderName: 'SARTHI Support Team'
  });

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: [email],
    subject: '🏆 Python Professional Developer Certification Unlocked!',
    html: emailHtml,
    text: `Hello ${user.name || 'Student'},\n\nYour Python Professional Developer Certification has been unlocked. Log in to start: https://sarthi-woad.vercel.app/certification-exams/python-professional`,
    headers: { 'X-Email-Type': 'notification' }
  });

  if (error) {
    console.error('❌ Resend Email Failed:', error);
  } else {
    console.log('✅ Resend Email Sent Successfully! ID:', data?.id);
  }
}

main()
  .catch((e) => {
    console.error('❌ Process Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
