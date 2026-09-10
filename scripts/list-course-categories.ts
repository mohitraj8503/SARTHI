import { prisma } from '../lib/prisma';

async function main() {
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            category: true,
            categoryId: true
        }
    });
    console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error);
