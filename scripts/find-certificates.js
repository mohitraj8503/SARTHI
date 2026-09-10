const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const certificates = await prisma.certificate.findMany({
    where: {
      courseId: 'summer-camp-2026'
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
  console.log("Certificates for Summer Camp 2026 in DB:", certificates);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
