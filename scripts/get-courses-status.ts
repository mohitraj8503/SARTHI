import { prisma } from '../lib/prisma';

async function main() {
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            category: true,
            teacherId: true,
            teacher: {
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    console.log(JSON.stringify(courses, null, 2));
}

main().catch(console.error);
