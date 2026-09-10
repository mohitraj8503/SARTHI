const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courseId = 'course_gst_itr_combo_2024';

  console.log(`--- Seeding modules & lessons for course: ${courseId} ---`);

  // Ensure course exists or create it
  let course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    // Find any existing instructor
    const anyUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!anyUser) {
      throw new Error('No users found in database to act as instructor');
    }
    course = await prisma.course.create({
      data: {
        id: courseId,
        title: 'GST Filing and Income Tax Returns',
        slug: 'gst-itr-combo',
        price: 4999.00,
        pricing_type: 'PAID',
        instructorId: anyUser.id,
        isPublished: true,
        status: 'PUBLISHED'
      }
    });
    console.log('✅ Course created since it did not exist');
  }

  // Clear existing modules and lessons for this course to avoid duplicates
  await prisma.lesson.deleteMany({ where: { courseId } });
  await prisma.module.deleteMany({ where: { courseId } });

  console.log('Cleared existing modules and lessons.');

  // Create Module 1
  const mod1 = await prisma.module.create({
    data: {
      title: 'Introduction to GST',
      courseId,
      order: 1
    }
  });

  // Create lessons for Module 1
  const lessonsMod1 = [
    {
      title: 'What is GST?',
      description: 'Understanding the fundamentals of Goods and Services Tax in India.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 8,
      orderNumber: 1
    },
    {
      title: 'GST Registration Process',
      description: 'Step-by-step walkthrough of obtaining a GST identification number (GSTIN).',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 10,
      orderNumber: 2
    },
    {
      title: 'Types of GST Returns',
      description: 'Overview of GSTR-1, GSTR-3B, GSTR-9, and other return types.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 7,
      orderNumber: 3
    }
  ];

  for (const l of lessonsMod1) {
    await prisma.lesson.create({
      data: {
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl,
        contentType: l.contentType,
        type: l.type,
        duration: l.duration,
        orderNumber: l.orderNumber,
        courseId,
        moduleId: mod1.id,
        isPublished: true
      }
    });
  }

  // Create Module 2
  const mod2 = await prisma.module.create({
    data: {
      title: 'Income Tax Basics',
      courseId,
      order: 2
    }
  });

  // Create lessons for Module 2
  const lessonsMod2 = [
    {
      title: 'Understanding Tax Slabs',
      description: 'New vs Old tax regime comparison and slab rates.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 12,
      orderNumber: 4
    },
    {
      title: 'Form ITR-1 vs ITR-4',
      description: 'Which form to select based on source and amount of income.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 15,
      orderNumber: 5
    },
    {
      title: 'Tax Deductions under Section 80C',
      description: 'Maximize your savings using PPF, ELSS, NPS, and other exemptions.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 8,
      orderNumber: 6
    },
    {
      title: 'E-Filing Process Overview',
      description: 'Quick walkthrough of the Income Tax e-filing portal registration and return verification.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      contentType: 'video',
      type: 'VIDEO',
      duration: 5,
      orderNumber: 7
    }
  ];

  for (const l of lessonsMod2) {
    await prisma.lesson.create({
      data: {
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl,
        contentType: l.contentType,
        type: l.type,
        duration: l.duration,
        orderNumber: l.orderNumber,
        courseId,
        moduleId: mod2.id,
        isPublished: true
      }
    });
  }

  console.log('✅ Successfully seeded Module 1 & Module 2 with lessons.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
