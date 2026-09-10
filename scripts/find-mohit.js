const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Find users with 'mohit' in name or email
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'mohit' } },
          { name: { contains: 'mohit' } }
        ]
      },
      include: {
        teacher: true
      }
    });
    console.log("=== USERS ===");
    console.log(JSON.stringify(users, null, 2));

    // 2. Find all courses and print their instructorId and teacherId
    const courses = await prisma.course.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        instructorId: true,
        teacherId: true
      }
    });
    console.log("\n=== COURSES (SAMPLE) ===");
    console.log(JSON.stringify(courses, null, 2));

    // 3. Find all teachers
    const teachers = await prisma.teacher.findMany({
      take: 5,
      select: {
        id: true,
        userId: true,
        status: true,
        teacherId: true
      }
    });
    console.log("\n=== TEACHERS (SAMPLE) ===");
    console.log(JSON.stringify(teachers, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
