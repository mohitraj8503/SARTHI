import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.internshipAssignment.count();
  const subCount = await prisma.internshipSubmission.count();
  console.log(`Assignments count: ${count}, Submissions count: ${subCount}`);
}
main().finally(() => prisma.$disconnect());
