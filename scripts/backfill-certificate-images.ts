import { prisma } from '../lib/prisma';
import { generateCertificateArtifacts } from '../lib/certificate/generateCertificateArtifacts';

async function main() {
  console.log('🚀 Starting backfill of certificate PNG/PDF artifacts...');

  // 1. Fetch VALID certificates from Certificate model missing imageUrl or pdfUrl
  const dbCerts = await prisma.certificate.findMany({
    where: {
      status: 'VALID',
      OR: [
        { imageUrl: null },
        { pdfUrl: null }
      ]
    },
    include: { user: true, course: true }
  });

  console.log(`Found ${dbCerts.length} base certificates requiring artifact generation.`);

  let certSuccess = 0;
  for (const cert of dbCerts) {
    try {
      let meta: any = {};
      if (cert.metadata) {
        try { meta = JSON.parse(cert.metadata); } catch (e) {}
      }

      const certNumber = cert.certificateNumber || cert.certificateId || cert.id;
      const studentName = cert.user?.name || meta.user_name || 'Student';
      const courseName = cert.course?.title || cert.title || meta.course_name || 'Professional Certification';
      const issueDate = cert.issuedAt ? cert.issuedAt.toLocaleDateString('en-GB') : '13.06.2025';

      console.log(`Processing Certificate ${certNumber} for ${studentName}...`);
      await generateCertificateArtifacts({
        certificateNumber: certNumber,
        studentName,
        courseName,
        issueDate,
        templateConfig: meta.templateConfig,
        userId: cert.userId,
        courseId: cert.courseId || undefined
      });
      certSuccess++;
    } catch (err) {
      console.error(`❌ Failed generating artifacts for cert ${cert.id}:`, err);
    }
  }

  // 2. Fetch VALID certificates from IssuedCertificate model missing imageUrl or pdfUrl
  const issuedCerts = await prisma.issuedCertificate.findMany({
    where: {
      status: 'VALID',
      OR: [
        { imageUrl: null },
        { pdfUrl: null }
      ]
    },
    include: { user: true, certification: true }
  });

  console.log(`Found ${issuedCerts.length} IssuedCertificate v2 rows requiring artifact generation.`);

  let issuedSuccess = 0;
  for (const cert of issuedCerts) {
    try {
      const certNumber = cert.verificationId || cert.id;
      const studentName = cert.user?.name || 'Student';
      const courseName = cert.certification?.title || 'Professional Certification';
      const issueDate = cert.issuedAt ? cert.issuedAt.toLocaleDateString('en-GB') : '13.06.2025';

      console.log(`Processing IssuedCertificate ${certNumber} for ${studentName}...`);
      await generateCertificateArtifacts({
        certificateNumber: certNumber,
        studentName,
        courseName,
        issueDate,
        userId: cert.userId,
        courseId: cert.certificationId
      });
      issuedSuccess++;
    } catch (err) {
      console.error(`❌ Failed generating artifacts for issued cert ${cert.id}:`, err);
    }
  }

  console.log(`\n✅ Backfill completed!`);
  console.log(`- Base certificates processed: ${certSuccess}/${dbCerts.length}`);
  console.log(`- Issued v2 certificates processed: ${issuedSuccess}/${issuedCerts.length}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error during backfill:', err);
  process.exit(1);
});
