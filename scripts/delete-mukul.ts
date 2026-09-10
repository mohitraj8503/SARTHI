import { prisma } from '../lib/prisma';

async function main() {
    // Delete Mukul Pandey from Teacher table
    const result = await prisma.teacher.deleteMany({
        where: {
            user: {
                email: 'admin@sarthi.in'
            }
        }
    });
    console.log(`Deleted Mukul Pandey: ${result.count}`);
}

main().catch(console.error);
