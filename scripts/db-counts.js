const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = [
    'user',
    'course',
    'chapter',
    'lesson',
    'enrollment',
    'teacher',
    'teacherApplication',
    'issuedCertificate',
    'blog',
    'seminar',
    'workshop',
    'payment'
  ];

  console.log('=== Database Table Row Counts ===');
  for (const model of models) {
    try {
      if (prisma[model]) {
        const count = await prisma[model].count();
        console.log(`- ${model}: ${count} rows`);
      } else {
        console.log(`- ${model}: (Model not found in prisma client)`);
      }
    } catch (e) {
      console.log(`- ${model}: Error getting count - ${e.message}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
