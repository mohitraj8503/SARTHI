import { PrismaClient } from '@prisma/client';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'nitin' } },
        { name: { contains: 'aniket' } },
        { email: { contains: 'nitin' } },
        { email: { contains: 'aniket' } }
      ]
    },
    select: { id: true, name: true, email: true, role: true }
  });

  const apps = await prisma.internshipApplication.findMany({
    where: {
      OR: [
        { name: { contains: 'nitin' } },
        { name: { contains: 'aniket' } },
        { email: { contains: 'nitin' } },
        { email: { contains: 'aniket' } }
      ]
    },
    select: { id: true, name: true, email: true, domain: true }
  });

  console.log('=== USERS ===');
  console.log(JSON.stringify(users, null, 2));

  console.log('=== APPLICATIONS ===');
  console.log(JSON.stringify(apps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
