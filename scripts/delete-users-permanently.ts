import { prisma } from '../lib/prisma';

async function main() {
    const keepEmails = [
        'mohitraj8503.edu@gmail.com',  // Mohit Raj (TT-FAC-0005)
        'siddiquisabiha411@gmail.com'  // Sabiha Siddiqui (TT-TCH-2026-0001)
    ];

    const deleteEmails = [
        'pm.enthuse@gmail.com',
        'priya.sharma@sarthi.com',
        'rahul.verma@sarthi.com',
        'anjali.mehra@sarthi.com',
        'vikas.jain@sarthi.com',
        'kavita.singh@sarthi.com',
        'dr.jeremy@sarthi-woad.vercel.app',
        'vighnesh@sarthi-woad.vercel.app',
        'instructor_mohit_raj@sarthi-woad.vercel.app'
    ];

    // Find users to delete to get their IDs
    const usersToDelete = await prisma.user.findMany({
        where: {
            email: {
                in: deleteEmails
            }
        }
    });

    const userIds = usersToDelete.map(u => u.id);
    console.log(`Deleting ${userIds.length} users permanently from all tables...`);

    if (userIds.length > 0) {
        // Delete dependencies
        await prisma.account.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
        await prisma.profile.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
        await prisma.teacher.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
        await prisma.enrollment.deleteMany({ where: { userId: { in: userIds } } }).catch(() => {});
        
        // Delete user records
        const result = await prisma.user.deleteMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });
        console.log(`Successfully deleted ${result.count} User records permanently.`);
    } else {
        console.log('No matching users found to delete.');
    }
}

main().catch(console.error);
