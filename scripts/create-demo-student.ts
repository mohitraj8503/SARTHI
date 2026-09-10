import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo_student@sarthi-woad.vercel.app';
  const password = 'DemoPassword123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      status: 'ACTIVE',
      onboarded: true,
      role: 'STUDENT'
    },
    create: {
      name: 'Demo Student',
      email,
      password: hashedPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      onboarded: true,
      studentId: 'STU-DEMO-001'
    }
  });

  console.log('✅ Demo student account created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Error creating demo student:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
