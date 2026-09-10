import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.batchMember.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      batch: true,
      submissions: {
        include: {
          assignment: true,
        }
      }
    }
  });

  console.log(`Found ${members.length} batch members (interns):`);
  for (const m of members) {
    console.log(`- Member ID: ${m.id}, Name: ${m.user.name}, Email: ${m.user.email}, Batch: ${m.batch.name}, Status: ${m.status}, Submissions Count: ${m.submissions.length}`);
  }

  const assignments = await prisma.internshipAssignment.findMany();
  console.log(`Found ${assignments.length} total internship assignments:`);
  for (const a of assignments) {
    console.log(`- Assignment ID: ${a.id}, Title: ${a.title}, Deadline: ${a.deadline}, BatchId: ${a.batchId}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
