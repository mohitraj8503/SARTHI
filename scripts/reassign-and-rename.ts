import { prisma } from '../lib/prisma';

async function main() {
    const mohitTeacherId = 'cmp9qrrmy0001zzsx13cd4oij'; // Mohit Raj Teacher Profile ID
    const sabihaTeacherId = 'cmpjt1yw700039etkbujsweo7'; // Sabiha Siddiqui Teacher Profile ID

    // 1. Rename and reassign Better Communication Skills course
    const communicationCourse = await prisma.course.findUnique({
        where: { id: 'course_better_communication_skills_women' }
    });

    if (communicationCourse) {
        await prisma.course.update({
            where: { id: 'course_better_communication_skills_women' },
            data: {
                title: 'Better Communication Skills in English',
                slug: 'better-communication-skills-in-english',
                teacherId: sabihaTeacherId
            }
        });
        console.log('Successfully updated Better Communication Skills in English title, slug, and teacher.');
    } else {
        console.log('Better Communication course not found by ID course_better_communication_skills_women');
    }

    // 2. Find and update all Technology & AI courses to Mohit Raj
    // Let's find them
    const courses = await prisma.course.findMany({
        where: {
            OR: [
                { categoryId: 'cat_artificial_intelligence' },
                { categoryId: 'cat_technology' },
                { category: { equals: 'Artificial Intelligence' } },
                { category: { equals: 'Technology' } },
                { category: { equals: 'AI & Data Science' } }
            ],
            NOT: {
                id: 'course_better_communication_skills_women' // Ensure we don't overwrite Better Communication
            }
        }
    });

    console.log(`Found ${courses.length} Technology/AI courses to allot to Mohit Raj.`);
    if (courses.length > 0) {
        const result = await prisma.course.updateMany({
            where: {
                id: {
                    in: courses.map(c => c.id)
                }
            },
            data: {
                teacherId: mohitTeacherId
            }
        });
        console.log(`Successfully allotted ${result.count} courses to Mohit Raj.`);
    }
}

main().catch(console.error);
