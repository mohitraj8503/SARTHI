import { prisma } from '../lib/prisma';

async function main() {
    const combo = await prisma.course.update({
        where: { id: 'course_gst_itr_combo_2024' },
        data: {
            thumbnail: '/course-thumbnails/GST-ITR.png'
        }
    });
    console.log('Successfully updated GST & Income Tax Filing Combo thumbnail to:', combo.thumbnail);
}

main().catch(console.error);
