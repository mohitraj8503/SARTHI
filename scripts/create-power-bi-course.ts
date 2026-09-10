import { prisma } from '../lib/prisma';

async function main() {
    const originalsInstructorId = 'cmomuhlsm0000uslvcljegtc2'; // SARTHI Originals User ID

    const powerBiCourse = await prisma.course.upsert({
        where: { id: 'course_power_bi_mastery_2026' },
        update: {
            title: 'Power BI Mastery — From Data to Decisions',
            slug: 'power-bi-mastery',
            category: 'Business',
            categoryId: 'cat_business',
            price: 2500,
            originalPrice: 5000,
            isPublished: true,
            isActive: true,
            publish_state: 'published',
            teacherId: null,
            level: 'Intermediate',
            pricing_type: 'PAID',
            instructorId: originalsInstructorId
        },
        create: {
            id: 'course_power_bi_mastery_2026',
            title: 'Power BI Mastery — From Data to Decisions',
            slug: 'power-bi-mastery',
            category: 'Business',
            categoryId: 'cat_business',
            price: 2500,
            originalPrice: 5000,
            isPublished: true,
            isActive: true,
            publish_state: 'published',
            teacherId: null,
            level: 'Intermediate',
            pricing_type: 'PAID',
            instructorId: originalsInstructorId
        }
    });

    console.log('Successfully upserted Power BI Mastery Course:', powerBiCourse.title);
}

main().catch(console.error);
