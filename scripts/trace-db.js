const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'mohit' } },
          { name: { contains: 'mohit' } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        teacher: {
          select: {
            id: true,
            teacherId: true,
            status: true
          }
        }
      }
    });
    console.log("=== MOHIT USERS ===");
    console.log(JSON.stringify(users, null, 2));

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        instructorId: true,
        teacherId: true,
        instructor: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
    console.log("\n=== ALL COURSES ===");
    console.log(JSON.stringify(courses, null, 2));

    const assignments = await prisma.assignment.findMany({
      select: {
        id: true,
        title: true,
        courseId: true,
        createdBy: true
      }
    });
    console.log("\n=== ALL ASSIGNMENTS ===");
    console.log(JSON.stringify(assignments, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
