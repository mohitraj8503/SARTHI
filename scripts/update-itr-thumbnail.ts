import { prisma } from '../lib/prisma';

async function main() {
    // 1. Update Income Tax Filing thumbnail
    const itr = await prisma.course.update({
        where: { id: 'course_itr_filing_2026' },
        data: {
            thumbnail: '/course-thumbnails/INCOME-TAX-FILING.jpeg'
        }
    });
    console.log('Successfully updated Income Tax Filing thumbnail to:', itr.thumbnail);

    // 2. Update GST Filing thumbnail
    const gst = await prisma.course.update({
        where: { id: 'course_gst_filing_2026' },
        data: {
            thumbnail: '/course-thumbnails/GST-FILING.jpeg'
        }
    });
    console.log('Successfully updated GST Filing thumbnail to:', gst.thumbnail);
}

main().catch(console.error);
