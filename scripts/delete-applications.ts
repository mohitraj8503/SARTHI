import { prisma } from '../lib/prisma';

async function main() {
    const keepEmails = [
        'mohitraj8503.edu@gmail.com',  // Mohit Raj (TT-FAC-0005)
        'siddiquisabiha411@gmail.com'  // Sabiha Siddiqui (TT-TCH-2026-0001)
    ];

    // Find applications to keep
    const keepApps = await prisma.teacherApplication.findMany({
        where: {
            user: {
                email: {
                    in: keepEmails
                }
            }
        }
    });

    const keepAppIds = keepApps.map(a => a.id);

    // Delete all other teacher applications
    const deleteResult = await prisma.teacherApplication.deleteMany({
        where: {
            NOT: {
                id: {
                    in: keepAppIds
                }
            }
        }
    });

    console.log(`Successfully deleted ${deleteResult.count} teacher applications from the database.`);
}

main().catch(console.error);
