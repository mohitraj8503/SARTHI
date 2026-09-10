const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.certification.updateMany({
      where: { status: 'DRAFT' },
      data: { status: 'PUBLISHED' }
    });
    console.log(`=== SUCCESSFULLY PUBLISHED ${result.count} CERTIFICATIONS ===`);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
