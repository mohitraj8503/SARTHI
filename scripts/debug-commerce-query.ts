import { prisma } from '../lib/prisma';

async function main() {
    const where = {
        publish_state: "published",
        isActive: true,
        isPublished: true,
        category: { in: ['Business', 'Finance'] }
    };
    const courses = await prisma.course.findMany({
        where,
        select: {
            id: true,
            title: true,
            category: true,
            categoryId: true,
            isActive: true,
            isPublished: true,
            publish_state: true,
            badge: true
        }
    });
    console.log("Matching courses count:", courses.length);
    console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error);
