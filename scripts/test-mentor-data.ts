import { PrismaClient } from '@prisma/client';
import { getMentorDashboardData } from '../lib/services/mentor.service';

const prisma = new PrismaClient();

async function main() {
  const email = 'pm.enthuse@gmail.com';
  console.log(`Fetching mentor dashboard data for ${email}...`);

  const data = await getMentorDashboardData(email);
  console.log('Number of batches:', data.batches.length);
  data.batches.forEach((b: any, i: number) => {
    console.log(`[${i}] ID: ${b.id}, Name: ${b.name}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
