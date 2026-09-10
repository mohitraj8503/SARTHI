import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const member = await prisma.batchMember.findFirst({
    where: { user: { name: { contains: 'Pranshu' } } },
    include: { user: true }
  });
  console.log(JSON.stringify(member, null, 2));
}

main().finally(() => prisma.$disconnect());
