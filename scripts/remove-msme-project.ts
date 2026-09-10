import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.project.deleteMany({
    where: {
      title: 'SARTHI MSME Industry Automation Portal'
    }
  });

  console.log(`Successfully deleted ${result.count} project(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
