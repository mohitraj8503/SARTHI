const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      include: {
        teacher: true
      }
    });
    console.log(`=== ALL ${users.length} USERS ===`);
    for (const u of users) {
      console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, TeacherStatus: ${u.teacher?.status}, TeacherId: ${u.teacher?.teacherId}`);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
