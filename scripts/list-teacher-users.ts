import { prisma } from '../lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        where: {
            role: {
                in: ['TEACHER', 'INSTRUCTOR', 'MENTOR']
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            teacher: {
                select: {
                    teacherId: true
                }
            }
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error);
