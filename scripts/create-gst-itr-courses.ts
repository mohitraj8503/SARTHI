import { prisma } from '../lib/prisma';

async function main() {
    const originalsInstructorId = 'cmomuhlsm0000uslvcljegtc2'; // SARTHI Originals User ID

    // 1. Create GST Filing Course
    const gstCourse = await prisma.course.upsert({
        where: { id: 'course_gst_filing_2026' },
        update: {
            title: 'GST Filing',
            slug: 'gst-filing',
            category: 'Finance',
            categoryId: 'cat_finance',
            price: 1500,
            originalPrice: 3000,
            isPublished: true,
            isActive: true,
            publish_state: 'published',
            teacherId: null,
            level: 'Beginner',
            pricing_type: 'PAID',
            instructorId: originalsInstructorId
        },
        create: {
            id: 'course_gst_filing_2026',
            title: 'GST Filing',
            slug: 'gst-filing',
            category: 'Finance',
            categoryId: 'cat_finance',
            price: 1500,
            originalPrice: 3000,
            isPublished: true,
            isActive: true,
            publish_state: 'published',
            teacherId: null,
            level: 'Beginner',
            pricing_type: 'PAID',
            instructorId: originalsInstructorId
        }
    });
    console.log('Successfully upserted GST Filing Course:', gstCourse.title);

    // 2. Create Income Tax Filing Course
    const itrCourse = await prisma.course.upsert({
        where: { id: 'course_itr_filing_2026' },
        update: {
            title: 'Income Tax Filing',
            slug: 'income-tax-filing',
            category: 'Finance',
            categoryId: 'cat_finance',
            price: 1500,
            originalPrice: 3000,
            isPublished: true,
            isActive: true,
            publish_state: 'published',
            teacherId: null,
            level: 'Beginner',
            pricing_type: 'PAID',
            instructorId: originalsInstructorId
        },
        create: {
            id: 'course_itr_filing_2026',
            title: 'Income Tax Filing',
            slug: 'income-tax-filing',
            category: 'Finance',
            categoryId: 'cat_finance',
            price: 1500,
            originalPrice: 3000,
            isPublished: true,
            isActive: true,
            publish_state: 'published',
            teacherId: null,
            level: 'Beginner',
            pricing_type: 'PAID',
            instructorId: originalsInstructorId
        }
    });
    console.log('Successfully upserted Income Tax Filing Course:', itrCourse.title);
}

main().catch(console.error);
