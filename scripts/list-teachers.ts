import { prisma } from '../lib/prisma';

async function main() {
    const teachers = await prisma.teacher.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });
    console.log(JSON.stringify(teachers, null, 2));
}

main().catch(console.error);
