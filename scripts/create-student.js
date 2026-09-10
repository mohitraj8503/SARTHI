const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'student@sarthi-woad.vercel.app';
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'STUDENT',
      status: 'active',
      onboarded: true,
    },
    create: {
      email,
      name: 'Test Student',
      password: hashedPassword,
      role: 'STUDENT',
      status: 'active',
      onboarded: true,
    }
  });

  console.log('✅ Student user configured successfully:', email);
  console.log('Password:', plainPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
