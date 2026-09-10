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
  console.log('--- DB INSPECTION FOR ALL 11 ACTIVE INTERNS ---');

  for (const email of activeEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    const app = await prisma.internshipApplication.findFirst({ where: { email } });
    const managed = await prisma.managedIntern.findUnique({ where: { email } });

    console.log(`\nEmail: ${email}`);
    console.log(`  User: Name="${user?.name}", College="${user?.college}", Track="${user?.internshipTrack || 'N/A'}"`);
    console.log(`  Application: Name="${app?.name}", College="${app?.college}", Track="${app?.internshipTrack || app?.domain || 'N/A'}", Date="${app?.submittedAt || 'N/A'}"`);
    console.log(`  ManagedIntern: Name="${managed?.fullName}", College="${managed?.college}", Track="${managed?.domain || 'N/A'}", JoinDate="${managed?.joiningDate || 'N/A'}", EndDate="${managed?.endDate || 'N/A'}"`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
