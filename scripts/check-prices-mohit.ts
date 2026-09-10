import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'mohitraj8503@gmail.com' }
  });
  if (!user) {
    console.log("Mohit not found");
    return;
  }
  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    select: { id: true, title: true, price: true }
  });
  console.log("Mohit's courses:");
  console.table(courses);
}
main().catch(console.error).finally(() => prisma.$disconnect());
