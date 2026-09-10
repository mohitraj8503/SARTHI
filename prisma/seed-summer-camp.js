const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const instructor = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'TEACHER'] } }
  });

  if (!instructor) {
    console.error('No instructor found');
    return;
  }

  const course = await prisma.course.upsert({
    where: { id: 'summer-camp-2026' },
    update: {
      status: 'PUBLISHED',
      isPublished: true,
      price: 11,
      thumbnail: '/course-thumbnails/Summer-Camp.png'
    },
    create: {
      id: 'summer-camp-2026',
      slug: 'summer-camp-2026',
      title: 'SARTHI Summer Camp 2026',
      description: 'A hands-on summer experience where young innovators learn Python from scratch.',
      shortDescription: 'Learn Python, AI, and Automation this summer.',
      price: 11,
      pricing_type: 'PAID',
      instructorId: instructor.id,
      isPublished: true,
      isActive: true,
      status: 'PUBLISHED',
      thumbnail: '/images/summer-camp-perfect-thumb.png',
      category: 'Programming'
    }
  });

  console.log('Course created/updated:', course.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
