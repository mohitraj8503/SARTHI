const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'mukul@sarthi-woad.vercel.app';
  const plainPassword = 'Mukul@123';
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      status: 'active',
      onboarded: true,
    },
    create: {
      email,
      name: 'Mukul Pandey',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'active',
      onboarded: true,
    }
  });

  console.log('✅ Mukul Admin user configured successfully:', email);
  console.log('Password:', plainPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
