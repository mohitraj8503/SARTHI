import { prisma } from '../lib/prisma';

async function main() {
  const app = await prisma.teacherApplication.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });
  console.log('App:', app);

  const user = await prisma.user.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });
  console.log('User:', user);
}

main().finally(() => prisma.$disconnect());
