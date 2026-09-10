import { prisma } from '../lib/prisma';
import { INITIAL_COURSES } from '../lib/initial-data';
import { clearResiliencyCache } from '../lib/resilient-db';

async function seedConnectingdotCourses() {
  console.log('🌱 Updating & Seeding Connectingdot Consultancy Executive Masterclasses with Soumya Dasgupta...');

  // Find or create Soumya Dasgupta instructor user in database
  let soumyaUser = await prisma.user.findFirst({
    where: { email: 'soumyacdpl@gmail.com' }
  });

  const soumyaBio = `MBA (IIM Calcutta) · FRM® · TOGAF 9 · ITIL V3
CBO & Co-Founder, Connectingdot Consultancy Pvt Ltd
• 20+ Years Global Experience across FinTech, Financial Risk, AI in Banking, and Startup Incubation.
• 500+ Professionals & Students Trained | Visiting/Guest Faculty across 6 IIMs (IIM Calcutta, Udaipur, Sirmaur, Lucknow, Vizag, Shillong), ICSI, and AIMK.
• Creator of LADA AI/ML credit risk platform deployed live in banks and NBFCs across India & Bangladesh (Patent Pending No. 202331054743, Winner — Global Banking & Finance Excellence Award 2025).
• Banking Training Delivered: BIRD (NABARD), IndusInd Bank, Axis Bank (Risk Academy & Corporate Banking), Hero Fincorp, SEMS Welfare Foundation.
• Global Experience: Accenture Financial Risk Advisory (US, Saudi Arabia), Credit Suisse Singapore (Cognizant), TCS, IRIS Software.
• Contact: soumyacdpl@gmail.com | (+91) 98865 96800`;

  if (!soumyaUser) {
    soumyaUser = await prisma.user.create({
      data: {
        email: 'soumyacdpl@gmail.com',
        name: 'Soumya Dasgupta',
        role: 'INSTRUCTOR',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        bio: soumyaBio,
      }
    });
    console.log(`👤 Created Instructor User Profile: Soumya Dasgupta (${soumyaUser.id})`);
  } else {
    soumyaUser = await prisma.user.update({
      where: { id: soumyaUser.id },
      data: {
        name: 'Soumya Dasgupta',
        role: 'INSTRUCTOR',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        bio: soumyaBio,
      }
    });
    console.log(`👤 Updated Instructor User Profile: Soumya Dasgupta (${soumyaUser.id})`);
  }

  const instructorId = soumyaUser.id;

  const executiveCourseIds = [
    'course_fintech_innovation_strategy_regulation',
    'course_financial_risk_management_ecl',
    'course_ai_machine_learning_in_banking',
    'course_ai_powered_startup_incubation'
  ];

  const targetCourses = INITIAL_COURSES.filter(c => executiveCourseIds.includes(c.id));

  for (const courseData of targetCourses) {
    console.log(`Processing: ${courseData.title}...`);

    try {
      const existing = await prisma.course.findUnique({
        where: { id: courseData.id }
      });

      if (existing) {
        await prisma.course.update({
          where: { id: courseData.id },
          data: {
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description,
            shortDescription: courseData.shortDescription,
            category: courseData.category,
            categoryId: courseData.categoryId,
            level: courseData.level,
            badge: courseData.badge,
            isFeatured: courseData.isFeatured,
            price: courseData.price,
            originalPrice: courseData.originalPrice,
            pricing_type: 'PAID',
            metaTitle: courseData.metaTitle,
            metaDescription: courseData.metaDescription,
            thumbnail: courseData.thumbnail,
            thumbnailUrl: courseData.thumbnail,
            instructorId: instructorId,
            isActive: true,
            isPublished: true,
            publish_state: 'published'
          }
        });
        console.log(`  ✅ Updated existing course record: ${courseData.title}`);
      } else {
        await prisma.course.create({
          data: {
            id: courseData.id,
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description,
            shortDescription: courseData.shortDescription,
            category: courseData.category,
            categoryId: courseData.categoryId,
            level: courseData.level,
            badge: courseData.badge,
            isFeatured: courseData.isFeatured,
            price: courseData.price,
            originalPrice: courseData.originalPrice,
            pricing_type: 'PAID',
            thumbnail: courseData.thumbnail,
            thumbnailUrl: courseData.thumbnail,
            isActive: true,
            isPublished: true,
            publish_state: 'published',
            metaTitle: courseData.metaTitle,
            metaDescription: courseData.metaDescription,
            instructorId: instructorId,
          }
        });
        console.log(`  ✅ Created new course: ${courseData.title}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to process ${courseData.title}:`, err);
    }
  }

  clearResiliencyCache();
  console.log('🎉 Connectingdot Executive Masterclasses update complete!');
}

seedConnectingdotCourses();
