import { PrismaClient } from '@prisma/client';
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'nandinikatiyar5@gmail.com' }
  });
  console.log("User:", user);

  const application = await prisma.internshipApplication.findFirst({
    where: { email: 'nandinikatiyar5@gmail.com' }
  });
  console.log("Application:", application);
}

main().catch(console.error).finally(() => prisma.$disconnect());
