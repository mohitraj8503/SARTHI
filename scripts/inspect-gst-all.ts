import { prisma } from '../lib/prisma';

async function main() {
    const courses = await prisma.course.findMany({
        where: {
            OR: [
                { id: { contains: 'gst' } },
                { id: { contains: 'tax' } },
                { title: { contains: 'GST' } },
                { title: { contains: 'Tax' } }
            ]
        }
    });

    console.log(`Found ${courses.length} courses:`);
    console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error);
