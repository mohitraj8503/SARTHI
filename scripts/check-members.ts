import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.batchMember.findMany({
    include: {
      user: true
    }
  });

  console.log('Total Batch Members:', members.length);
  members.forEach((m, i) => {
    console.log(`[${i}] Member ID: ${m.id}, User ID: ${m.userId}, Name: ${m.user.name}, Email: ${m.user.email}, Status: ${m.status}, Ref: ${m.referenceNumber}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
