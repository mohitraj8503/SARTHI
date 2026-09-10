import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateDeadlines() {
  console.log('🚀 Updating deadlines for Task 2 and Day 3 Task to 30 July 2026 7:00 PM IST...');

  // Set target deadline: 30 July 2026, 19:00:00 IST (13:30:00 UTC)
  const targetDeadline = new Date('2026-07-30T19:00:00+05:30');

  // Find assignments matching Task 2 and Day 3
  const assignments = await prisma.internshipAssignment.findMany({
    where: {
      OR: [
        { title: { contains: 'Day 3' } },
        { title: { contains: 'Task 2' } },
        { title: { contains: 'Student Ambassador' } },
        { title: { contains: 'Promote SARTHI' } },
      ]
    }
  });

  console.log(`Found ${assignments.length} matching assignments in DB.`);

  for (const a of assignments) {
    await prisma.internshipAssignment.update({
      where: { id: a.id },
      data: { deadline: targetDeadline }
    });
    console.log(`✅ Updated Assignment ID: ${a.id} | Title: "${a.title}" | New Deadline: ${targetDeadline.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  }

  console.log('🎉 Both task deadlines updated in DB successfully! (No emails sent)');
}

updateDeadlines()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
