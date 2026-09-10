import { PrismaClient } from '@prisma/client';
require('dotenv').config();

const prisma = new PrismaClient();

const internNames = [
  'Kumari Tejal',
  'Pranshu Kumar Singh',
  'Keshav Kumar',
  'Prateek Singh Parmar',
  'Ashek Ali Shah',
  'Divya',
  'Ritesh Kumar',
  'Harsh Ubale',
  'Vivek Sharma',
  'Jaanvi Nair',
  'Nandini Katiyar',
  'Mohd Zaid',
  'Kasim Rasool'
];

async function main() {
  console.log('Searching database for 13 interns...');
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });

  const apps = await prisma.internshipApplication.findMany({
    select: { id: true, fullName: true, email: true }
  });

  const result: Record<string, string> = {};

  for (const name of internNames) {
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ').slice(-1)[0].toLowerCase();

    const userMatch = users.find(u => 
      u.name && (
        u.name.toLowerCase().includes(name.toLowerCase()) || 
        (u.name.toLowerCase().includes(firstName) && u.name.toLowerCase().includes(lastName))
      )
    );

    const appMatch = apps.find(a => 
      a.fullName && (
        a.fullName.toLowerCase().includes(name.toLowerCase()) || 
        (a.fullName.toLowerCase().includes(firstName) && a.fullName.toLowerCase().includes(lastName))
      )
    );

    const foundEmail = userMatch?.email || appMatch?.email || 'NOT_FOUND';
    result[name] = foundEmail;
    console.log(`- ${name}: ${foundEmail}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
