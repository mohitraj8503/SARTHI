import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'jaiswalabhinav073@gmail.com';
  const plainPassword = 'Abhinav@2026#TT';
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { email },
      data: {
        name: 'Abhinav Prakash',
        password: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        enrollmentNumber: 'TT-STU-0132',
        emailVerified: existingUser.emailVerified || new Date(),
      },
    });
    console.log('✅ User updated successfully:');
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Abhinav Prakash',
        password: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        enrollmentNumber: 'TT-STU-0132',
        emailVerified: new Date(),
      },
    });
    console.log('✅ User created successfully:');
  }

  const isMatch = await bcrypt.compare(plainPassword, user.password!);
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    enrollmentNumber: user.enrollmentNumber,
    status: user.status,
    role: user.role,
    passwordMatch: isMatch,
  });

  console.log('\n--- CREDENTIALS FOR USER ---');
  console.log(`Email/ID: ${user.email}`);
  console.log(`Password: ${plainPassword}`);
  console.log(`Enrollment Number: ${user.enrollmentNumber}`);
}

main()
  .catch((e) => {
    console.error('Error setting up credentials:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
