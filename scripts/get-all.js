const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    console.log("=== ALL USERS ===");
    console.log(JSON.stringify(users, null, 2));

    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        userId: true,
        teacherId: true,
        status: true
      }
    });
    console.log("=== ALL TEACHERS ===");
    console.log(JSON.stringify(teachers, null, 2));

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        instructorId: true,
        teacherId: true
      }
    });
    console.log("=== ALL COURSES ===");
    console.log(JSON.stringify(courses, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
