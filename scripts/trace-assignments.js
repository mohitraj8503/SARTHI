const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const assignments = await prisma.assignment.findMany({
      select: {
        id: true,
        title: true,
        courseId: true,
        createdBy: true,
        course: {
          select: {
            title: true
          }
        }
      }
    });
    console.log("=== ALL ASSIGNMENTS ===");
    console.log(JSON.stringify(assignments, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
