import { prisma } from '../lib/prisma';

async function main() {
  console.log('=== INSPECTING EXISTING DB CERTIFICATES ===\n');

  const certs = await prisma.certificate.findMany();
  console.log(`Found ${certs.length} Certificate rows in DB:`);

  for (const c of certs) {
    console.log(`\nCert ID: ${c.id} | Certificate Number: ${c.certificateNumber}`);
    console.log(`  User ID: ${c.userId}`);
    console.log(`  Metadata: ${c.metadata}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
