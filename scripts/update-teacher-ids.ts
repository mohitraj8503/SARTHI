import { prisma } from '../lib/prisma';

async function main() {
    // 1. Update Mohit Raj (email: mohitraj8503.edu@gmail.com)
    const mohitUser = await prisma.user.findUnique({
        where: { email: 'mohitraj8503.edu@gmail.com' }
    });
    if (mohitUser) {
        await prisma.teacher.update({
            where: { userId: mohitUser.id },
            data: { teacherId: 'TT-FAC-0001' }
        });
        console.log('Successfully updated Mohit Raj IDs to TT-FAC-0001');
    }

    // 2. Update Sabiha Siddiqui (email: siddiquisabiha411@gmail.com)
    const sabihaUser = await prisma.user.findUnique({
        where: { email: 'siddiquisabiha411@gmail.com' }
    });
    if (sabihaUser) {
        await prisma.teacher.update({
            where: { userId: sabihaUser.id },
            data: { teacherId: 'TT-FAC-0002' }
        });
        console.log('Successfully updated Sabiha Siddiqui IDs to TT-FAC-0002');
    }
}

main().catch(console.error);
