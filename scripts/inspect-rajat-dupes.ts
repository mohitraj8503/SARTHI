import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== INSPECTING ALL RAJAT RECORDS ===');

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'rajatchoudhury5@gmail.com' },
        { name: { contains: 'Rajat' } },
      ],
    },
    include: {
      teacher: true,
    },
  });

  console.log('Users found:', JSON.stringify(users, null, 2));

  const applications = await prisma.teacherApplication.findMany({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });
  console.log('TeacherApplications found:', JSON.stringify(applications, null, 2));

  const teachers = await prisma.teacher.findMany({
    where: {
      OR: [
        { teacherEmail: 'rajatchoudhury5@gmail.com' },
        { user: { name: { contains: 'Rajat' } } },
      ],
    },
    include: {
      user: true,
    },
  });
  console.log('Teachers found:', JSON.stringify(teachers, null, 2));
}

main().finally(() => prisma.$disconnect());
