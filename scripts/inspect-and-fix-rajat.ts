import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== INSPECTING RAJAT APPLICATION ===');

  const app = await prisma.teacherApplication.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });

  console.log('Teacher Application:', JSON.stringify(app, null, 2));

  const user = await prisma.user.findFirst({
    where: { email: 'rajatchoudhury5@gmail.com' },
  });

  console.log('User Record:', JSON.stringify(user, null, 2));
}

main().finally(() => prisma.$disconnect());
