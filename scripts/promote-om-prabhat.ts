import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getBrandedTemplate } from '../lib/email/templates/branded';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const emailToTarget = 'omprabhat2106@gmail.com';
  const emailToDelete = 'omprabhat@gmail.com';
  
  console.log(`[1/4] Checking for duplicate user ${emailToDelete}...`);
  const oldUser = await prisma.user.findUnique({ where: { email: emailToDelete } });
  if (oldUser) {
    // Cannot hard-delete due to notification relations — already marked DELETED, skip
    console.log(`Old account (${emailToDelete}) already marked ${oldUser.status}, skipping hard-delete.`);
  }

  console.log(`[2/4] Finding main user ${emailToTarget}...`);
  const user = await prisma.user.findUnique({
    where: { email: emailToTarget }
  });

  if (!user) {
    console.error('User not found!');
    process.exit(1);
  }
  
  console.log(`[3/4] Uplifting status from ${user.status} to ACTIVE...`);
  await prisma.user.update({
    where: { email: emailToTarget },
    data: { status: 'ACTIVE' }
  });
  console.log('Status updated successfully.');

  console.log(`[4/4] Sending promotion email...`);
  
  const emailBody = `Dear Om Prabhat,

We are writing to officially update your internship structure and title at SARTHI. Based on your prior experience and coordination efforts, we have merged your records and formalized your role as follows:

**Final structure:**

**Software Engineering Intern**
*June 2026 – July 2026*
[description: core dev/marketing/editing work]

**Intern Project Lead**
*August 2026 – Present*
[description: Leading a team of interns on project deliverables, building on prior experience as a Software Engineering Intern on the same team.]

You have been entrusted to coordinate and mentor interns for us. Please note that these responsibilities require strict adherence to our policies.

**Failure of terms may lead to hard actions**, including immediate termination of your position.`;

  const htmlContent = getBrandedTemplate({
    badge: 'ROLE UPDATE',
    heading: 'Internship Promotion & Updated Structure',
    body: emailBody,
    senderName: 'SARTHI Management'
  });

  try {
    const data = await resend.emails.send({
      from: 'SARTHI <admin@sarthi.in>',
      to: emailToTarget,
      subject: 'Internship Promotion & Updated Structure',
      html: htmlContent
    });
    console.log('Email sent successfully:', data);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
