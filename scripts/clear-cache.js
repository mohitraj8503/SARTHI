const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

async function main() {
  const prisma = new PrismaClient();

  const user = await prisma.user.findFirst({
    where: { email: 'mohitraj8503.edu@gmail.com' }
  });

  if (!user) {
    console.error('User not found!');
    await prisma.$disconnect();
    return;
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id }
  });

  if (!teacher) {
    console.error('Teacher profile not found!');
    await prisma.$disconnect();
    return;
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('Connecting to Redis:', redisUrl);
    const redis = new Redis(redisUrl);
    const keys = [
      `teacher:dashboard:stats:${user.id}`,
      `teacher:students:list:${teacher.id}`,
      `teacher:courses:list:${user.id}`
    ];
    for (const key of keys) {
      await redis.del(key);
      console.log(`Successfully deleted Redis key: ${key}`);
    }
    await redis.quit();
  } else {
    console.log('REDIS_URL environment variable is not defined.');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
