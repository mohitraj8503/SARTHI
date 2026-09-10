import { prisma } from '../lib/prisma';

async function main() {
    const mohitTeacherId = 'cmp9qrrmy0001zzsx13cd4oij'; // Mohit Raj Teacher Profile ID

    const updatedCourse = await prisma.course.update({
        where: { id: 'course_data_analytics_with_excel' },
        data: {
            teacherId: mohitTeacherId
        }
    });

    console.log(`Successfully allotted Mohit Raj to Data Analytics with Excel course. Teacher ID: ${updatedCourse.teacherId}`);
}

main().catch(console.error);
