import { prisma } from '../lib/prisma';

async function main() {
    const mohitTeacherId = 'cmp9qrrmy0001zzsx13cd4oij'; // Mohit Raj Teacher Profile ID

    // Find all courses belonging to Technology or Artificial Intelligence
    const courses = await prisma.course.findMany({
        where: {
            OR: [
                { categoryId: 'cat_artificial_intelligence' },
                { categoryId: 'cat_technology' },
                { category: { equals: 'Artificial Intelligence' } },
                { category: { equals: 'Technology' } },
                { category: { equals: 'AI & Data Science' } } // To cover AI & Data Science
            ]
        }
    });

    console.log(`Found ${courses.length} courses to reassign to Mohit Raj:`);
    for (const c of courses) {
        console.log(`- ID: ${c.id}, Title: ${c.title}, Category: ${c.category}`);
    }

    if (courses.length > 0) {
        const updateResult = await prisma.course.updateMany({
            where: {
                id: {
                    in: courses.map(c => c.id)
                }
            },
            data: {
                teacherId: mohitTeacherId
            }
        });
        console.log(`Successfully updated ${updateResult.count} courses to Mohit Raj.`);
    }
}

main().catch(console.error);
