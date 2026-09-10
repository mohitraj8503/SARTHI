import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDemoCredentials() {
  console.log('🌱 Seeding demo credentials for SARTHI...');

  const accounts = [
    {
      email: 'student.demo@imd.gov.in',
      name: 'Mohit Raj',
      role: 'STUDENT',
      passwordPlain: 'StudentDemo@123',
    },
    {
      email: 'trainer.demo@imd.gov.in',
      name: 'IMD Senior Trainer',
      role: 'TEACHER',
      passwordPlain: 'TrainerDemo@123',
    },
    {
      email: 'trainer@sarthi.gov.in',
      name: 'IMD Faculty Trainer',
      role: 'TEACHER',
      passwordPlain: 'TrainerDemo@123',
    },
    {
      email: 'faculty.demo@imd.gov.in',
      name: 'IMD Faculty Trainer',
      role: 'TEACHER',
      passwordPlain: 'TrainerDemo@123',
    },
    {
      email: 'admin@imd.gov.in',
      name: 'SARTHI Super Admin',
      role: 'ADMIN',
      passwordPlain: 'AdminDemo@123',
    },
    {
      email: 'admin.demo@imd.gov.in',
      name: 'SARTHI Super Admin',
      role: 'ADMIN',
      passwordPlain: 'AdminDemo@123',
    },
    {
      email: 'admin@sarthi.in',
      name: 'SARTHI Admin',
      role: 'ADMIN',
      passwordPlain: 'AdminDemo@123',
    },
  ];

  for (const acc of accounts) {
    const hashedPassword = await bcrypt.hash(acc.passwordPlain, 10);
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        role: acc.role as any,
        status: 'ACTIVE',
        onboarded: true,
        password: hashedPassword,
      },
      create: {
        email: acc.email,
        name: acc.name,
        role: acc.role as any,
        status: 'ACTIVE',
        onboarded: true,
        password: hashedPassword,
      },
    });

    console.log(`✅ User synced: ${user.email} (${user.role})`);

    // Ensure teacher profile exists for TEACHER accounts
    if (acc.role === 'TEACHER') {
      await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {
          title: 'Senior Faculty & Technical Trainer',
          status: 'APPROVED',
          canCreateCourses: true,
        },
        create: {
          userId: user.id,
          title: 'Senior Faculty & Technical Trainer',
          status: 'APPROVED',
          canCreateCourses: true,
        },
      });
      console.log(`   👨‍🏫 Teacher profile verified: ${user.email}`);
    }
  }

  console.log('✨ All demo accounts successfully seeded and verified!');
}

seedDemoCredentials()
  .catch((e) => {
    console.error('❌ Error during demo credential seed:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
