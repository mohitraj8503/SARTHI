const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certification.findMany();
  console.log('=== Certifications in DB ===');
  for (const c of certs) {
    console.log(`- ID: ${c.id}, Title: ${c.title}, Slug: ${c.slug}, Status: ${c.status}`);
  }
}

main().finally(() => prisma.$disconnect());
