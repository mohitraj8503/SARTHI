import { prisma } from '../lib/prisma';

async function main() {
  const teachers = await prisma.teacher.findMany();
  console.log('All teacher profiles in DB:', JSON.stringify(teachers, null, 2));
}

main().finally(() => prisma.$disconnect());
