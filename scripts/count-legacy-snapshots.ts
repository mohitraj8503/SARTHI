import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const v2 = await prisma.issuedCertificate.findMany({
      select: { verificationId: true, certificateUrl: true, issuedAt: true }
    });
    
    console.log(`\nIssuedCertificate (v2) total: ${v2.length}`);
    v2.forEach(c => console.log(`- ${c.verificationId} | URL: ${c.certificateUrl}`));

    const legacy = await prisma.userCertification.findMany({
      select: { certNumber: true, certificateHash: true }
    });
    console.log(`\nUserCertification (legacy) total: ${legacy.length}`);
    legacy.forEach(c => console.log(`- ${c.certNumber} | Hash: ${c.certificateHash}`));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
