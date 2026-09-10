import { prisma } from '../lib/prisma';

const activeEmails = [
  'ranjansingh.w@gmail.com',
  'nairjaanvi199@gmail.com',
  'nandinikatiyar5@gmail.com',
  'ps859521@gmail.com',
  'surjobanerjee207@gmail.com',
  'kumarkeshav10320@gmail.com',
  'keshavruhela25@gmail.com',
  'kumaritejal535@gmail.com',
  'aniketdutta615@gmail.com',
  'nitinsinha062@gmail.com',
  'harshnayan018@gmail.com'
];

async function main() {
  console.log('=== INSPECTING DURATION (1m / 2m / 3m) FOR ALL ACTIVE INTERNS ===\n');

  for (const email of activeEmails) {
    const app = await prisma.internshipApplication.findFirst({ where: { email } });
    const user = await prisma.user.findUnique({ where: { email } });
    const managed = await prisma.managedIntern.findUnique({ where: { email } });

    console.log(`\nCandidate: ${app?.name || user?.name || email}`);
    console.log(`  Email: ${email}`);
    console.log(`  Application Domain/Track: ${app?.internshipTrack || app?.domain || 'N/A'}`);
    console.log(`  Application Course/Sem:   ${app?.course || 'N/A'} (Sem ${app?.semester || 'N/A'})`);
    console.log(`  Statement / Notes:        ${app?.statement || 'N/A'}`);
    console.log(`  SubmittedAt:              ${app?.submittedAt ? new Date(app.submittedAt).toISOString() : 'N/A'}`);
    console.log(`  PaidAt:                   ${app?.paidAt ? new Date(app.paidAt).toISOString() : 'N/A'}`);
    console.log(`  OfferAcceptedAt:          ${app?.offerAcceptedAt ? new Date(app.offerAcceptedAt).toISOString() : 'N/A'}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
