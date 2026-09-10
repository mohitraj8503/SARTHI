import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- UPDATING CERTIFICATION EXAM PRICES TO 2000 ---');

  try {
    const result = await prisma.certification.updateMany({
      data: {
        price: 2000
      }
    });

    console.log(`Successfully updated ${result.count} certification exams to ₹2000.`);
  } catch (err) {
    console.error('Error during patch:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
