const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const certs = await prisma.certification.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        status: true,
        passingScore: true,
        price: true
      }
    });
    console.log("=== CERTIFICATIONS IN DATABASE ===");
    console.log(JSON.stringify(certs, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
