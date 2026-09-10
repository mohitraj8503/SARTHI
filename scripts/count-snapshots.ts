import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const certs = await prisma.certificate.findMany({
      select: {
        certificateNumber: true,
        htmlSnapshot: true,
        issuedAt: true
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    console.log(`Total Certificates: ${certs.length}`);
    let missingCount = 0;
    
    certs.forEach(c => {
      const isMissing = !c.htmlSnapshot;
      if (isMissing) missingCount++;
      console.log(`- ${c.certificateNumber} | Missing Snapshot: ${isMissing} | Issued: ${c.issuedAt}`);
    });
    
    console.log(`\nTOTAL MISSING SNAPSHOTS: ${missingCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
