const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certification.findMany({
    include: {
      questionsV2: true
    }
  });

  console.log('=== All Certifications in DB ===');
  for (const cert of certs) {
    console.log(`- Slug: ${cert.slug}, Title: ${cert.title}, Questions: ${cert.questionsV2.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
