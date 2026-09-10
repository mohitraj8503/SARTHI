import { prisma } from '../lib/prisma';

async function main() {
    const mohitTeacherId = 'cmp9qrrmy0001zzsx13cd4oij'; // Mohit Raj Teacher Profile ID

    const updatedCourse = await prisma.course.update({
        where: { id: 'course_power_bi_mastery_2026' },
        data: {
            teacherId: mohitTeacherId
        }
    });

    console.log(`Successfully allotted Mohit Raj to Power BI Mastery course. Teacher ID: ${updatedCourse.teacherId}`);
}

main().catch(console.error);
