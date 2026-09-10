import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== TEACHERS / USERS CHECK ===');
  
  const techTomorrowOriginals = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'SARTHI Originals' } },
        { email: { contains: 'instructor_mohit_raj' } },
      ],
    },
    include: {
      courses: { select: { id: true, title: true } },
    },
  });
  console.log('SARTHI Originals Users:', JSON.stringify(techTomorrowOriginals, null, 2));

  const rajat = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: 'Rajat' } },
        { email: { contains: 'rajat' } },
      ],
    },
  });
  console.log('Rajat Users:', JSON.stringify(rajat, null, 2));

  const allTeachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
  console.log('All Teachers:', JSON.stringify(allTeachers, null, 2));
}

main().finally(() => prisma.$disconnect());
