import { prisma } from '../lib/prisma';

async function main() {
    // Find all courses with title matching GST, Income Tax, or ITR
    const gstCourses = await prisma.course.findMany({
        where: {
            OR: [
                { title: { contains: 'GST' } },
                { title: { contains: 'Income Tax' } },
                { title: { contains: 'ITR' } }
            ]
        }
    });

    console.log(`Found ${gstCourses.length} GST/Income Tax courses in the database:`);
    for (const c of gstCourses) {
        console.log(`- ID: ${c.id}, Title: ${c.title}, Current Category: ${c.category}`);
    }

    if (gstCourses.length > 0) {
        const updateResult = await prisma.course.updateMany({
            where: {
                id: {
                    in: gstCourses.map(c => c.id)
                }
            },
            data: {
                category: 'Finance',
                categoryId: 'cat_finance'
            }
        });
        console.log(`Successfully updated ${updateResult.count} courses to Commerce & Management (Finance) category.`);
    }
}

main().catch(console.error);
