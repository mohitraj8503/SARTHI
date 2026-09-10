import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- PATCHING SIGNATURE URLS IN SNAPSHOTS ---');
  let updatedCount = 0;

  try {
    const certs = await prisma.certificate.findMany({
      where: {
        htmlSnapshot: {
          contains: 'https://sarthi-woad.vercel.app/signature-mukul-pandey.png'
        }
      }
    });

    console.log(`Found ${certs.length} certificates with hardcoded production signature URLs...`);

    for (const cert of certs) {
      if (cert.htmlSnapshot) {
        const fixedSnapshot = cert.htmlSnapshot.replace(/https:\/\/sarthi\.in\/signature-mukul-pandey\.png/g, '/signature-mukul-pandey.png');
        await prisma.certificate.update({
          where: { id: cert.id },
          data: { htmlSnapshot: fixedSnapshot }
        });
        updatedCount++;
      }
    }

    console.log(`Successfully patched ${updatedCount} certificates.`);
  } catch (err) {
    console.error('Error during patch:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
