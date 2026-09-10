import { prisma } from '../lib/prisma';

async function main() {
    const courseIdsToDelete = [
        'course_excel_dashboard_mis_reporting',
        'course_advanced_microsoft_excel_course'
    ];

    const deleteResult = await prisma.course.deleteMany({
        where: {
            id: {
                in: courseIdsToDelete
            }
        }
    });

    console.log(`Successfully deleted ${deleteResult.count} Excel courses from the database.`);
}

main().catch(console.error);
