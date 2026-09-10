const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating database certificate URLs to use /certification-exams/verify/...');

  // 1. Update IssuedCertificate records
  const issuedCerts = await prisma.issuedCertificate.findMany();
  let issuedCount = 0;
  for (const cert of issuedCerts) {
    if (cert.certificateUrl && cert.certificateUrl.includes('/certifications/verify/')) {
      const newUrl = cert.certificateUrl.replace('/certifications/verify/', '/certification-exams/verify/');
      await prisma.issuedCertificate.update({
        where: { id: cert.id },
        data: { certificateUrl: newUrl }
      });
      console.log(`Updated IssuedCertificate ID: ${cert.id} -> ${newUrl}`);
      issuedCount++;
    }
  }

  // 2. Update Certificate records (fallback table)
  const certs = await prisma.certificate.findMany();
  let certsCount = 0;
  for (const cert of certs) {
    if (cert.certificateUrl && cert.certificateUrl.includes('/certifications/verify/')) {
      const newUrl = cert.certificateUrl.replace('/certifications/verify/', '/certification-exams/verify/');
      await prisma.certificate.update({
        where: { id: cert.id },
        data: { certificateUrl: newUrl }
      });
      console.log(`Updated Certificate ID: ${cert.id} -> ${newUrl}`);
      certsCount++;
    }
  }

  console.log(`\n✅ Database update complete!`);
  console.log(`Updated ${issuedCount} IssuedCertificate records.`);
  console.log(`Updated ${certsCount} Certificate records.`);
}

main()
  .catch(e => {
    console.error('❌ Failed to update database URLs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
