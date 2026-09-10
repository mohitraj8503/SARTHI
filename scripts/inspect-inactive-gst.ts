import { prisma } from '../lib/prisma';

async function main() {
    const courses = await prisma.course.findMany({
        where: {
            id: {
                in: ['course_gst_filing_2024', 'course_itr_filing_2024']
            }
        }
    });

    console.log(`Found ${courses.length} courses:`);
    console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error);
