const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
    where: { slug: 'summer-camp-2026' }
  });
  console.log('Course ID:', course?.id);
  console.log('Course Slug:', course?.slug);
  console.log('Course Thumbnail in DB:', course?.thumbnail);
  console.log('Course IntroVideoUrl in DB:', course?.introVideoUrl);
}

main().catch(console.error).finally(() => prisma.$disconnect());
