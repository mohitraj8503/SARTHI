const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Summer Camp 2026 Seeding ---');

  // 1. Find or create instructor
  let instructor = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'TEACHER'] } }
  });

  if (!instructor) {
    console.log('No instructor found, creating a default admin...');
    instructor = await prisma.user.create({
      data: {
        email: 'admin@sarthi.com',
        name: 'Expert Mentor',
        role: 'ADMIN',
        status: 'active',
        onboarded: true
      }
    });
  }
  console.log('Using Instructor ID:', instructor.id);

  // 2. Find or create category
  let category = await prisma.category.findFirst({
    where: { slug: 'development' }
  });

  if (!category) {
    console.log('Creating Development category...');
    category = await prisma.category.create({
      data: {
        id: 'cat_development',
        name: 'Development',
        slug: 'development'
      }
    });
  }

  // 3. Create/Upsert Course
  const courseId = 'summer-camp-2026';
  const course = await prisma.course.upsert({
    where: { id: courseId },
    update: {
      title: 'SARTHI Summer Camp 2026',
      slug: 'summer-camp-2026',
      description: 'A hands-on summer experience where young innovators learn Python from scratch.',
      shortDescription: 'Learn Python, AI, and Automation this summer.',
      price: 11,
      pricing_type: 'PAID',
      instructorId: instructor.id,
      isPublished: true,
      isActive: true,
      status: 'PUBLISHED',
      thumbnail: '/course-thumbnails/Summer-Camp.png',
      categoryId: category.id,
      level: 'Beginner',
      updatedAt: new Date()
    },
    create: {
      id: courseId,
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
      thumbnail: '/course-thumbnails/Summer-Camp.png',
      categoryId: category.id,
      level: 'Beginner'
    }
  });

  console.log('✅ Course seeded successfully:', course.id);
  console.log('Slug:', course.slug);
  console.log('Price:', course.price.toString());
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
