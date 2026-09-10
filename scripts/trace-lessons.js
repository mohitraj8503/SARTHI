const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: "cmouful2u00019rcrv1r8au79" },
      select: {
        id: true,
        title: true,
        moduleId: true
      }
    });
    console.log("=== COURSE LESSONS ===");
    console.log(JSON.stringify(lessons, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
