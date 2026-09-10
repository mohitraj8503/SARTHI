import { prisma } from '../lib/prisma';

async function main() {
    const keepUserIds = [
        'cmp9eaqu600008iuvgyokhpxw', // Mohit Raj (TT-FAC-0005)
        'cmpjt1yqo00019etkmbbcra0u'  // Sabiha Siddiqui (TT-TCH-2026-0001)
    ];

    const result = await prisma.user.updateMany({
        where: {
            role: {
                in: ['TEACHER', 'INSTRUCTOR', 'MENTOR']
            },
            NOT: {
                id: {
                    in: keepUserIds
                }
            }
        },
        data: {
            role: 'STUDENT'
        }
    });

    console.log(`Demoted ${result.count} users to STUDENT role.`);
}

main().catch(console.error);
