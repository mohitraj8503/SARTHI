import { prisma } from '../lib/prisma';

async function main() {
  const alok = await prisma.user.findFirst({
    where: {
      email: 'alok.singh@arkajainuniversity.ac.in'
    },
    include: {
      teacher: true
    }
  });

  console.log('Alok User in DB:', JSON.stringify(alok, null, 2));
}

main().finally(() => prisma.$disconnect());
