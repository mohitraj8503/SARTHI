import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      email: 'kumaritejal535@gmail.com'
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Stored raw password field:', user.password);

  // Set password to a known dev password if needed or check if plain text
  const isBcrypt = user.password && user.password.startsWith('$2');
  if (isBcrypt) {
    const defaultPass = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log(`Password for ${user.email} reset to default dev password: "${defaultPass}"`);
  }
}

main().finally(() => prisma.$disconnect());
