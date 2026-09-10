import { prisma } from '../lib/prisma';

async function main() {
    const courseIdsToDelete = [
        'course_business_analyst_career_program',
        'course_chatgpt_ai_productivity_masterclass',
        'course_ai_automation_for_business',
        'course_ai_tools_for_students_professionals',
        'course_business_analytics_course',
        'course_power_bi_complete_course'
    ];

    const deleteResult = await prisma.course.deleteMany({
        where: {
            id: {
                in: courseIdsToDelete
            }
        }
    });

    console.log(`Successfully deleted ${deleteResult.count} courses from the database.`);
}

main().catch(console.error);
