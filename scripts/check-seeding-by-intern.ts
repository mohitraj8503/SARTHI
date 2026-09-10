import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.batchMember.findMany({
    include: {
      user: true,
      individualAssignments: true
    }
  });

  console.log(`=== Seeding status by BatchMember ===`);
  for (const m of members) {
    if (m.individualAssignments.length > 0) {
      console.log(`Intern: ${m.user.name} | InternID: ${m.permanentInternId} | Assignments: ${m.individualAssignments.length}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
