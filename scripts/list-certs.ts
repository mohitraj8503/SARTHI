import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certification.findMany();
  console.log("Certifications in Database:", certs.map(c => ({ id: c.id, title: c.title })));
}

main().finally(() => prisma.$disconnect());
