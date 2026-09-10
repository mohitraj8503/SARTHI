import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certification.findMany();
  console.log("All Certifications in DB:", certs.map(c => ({ id: c.id, title: c.title, slug: c.slug, status: c.status })));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
