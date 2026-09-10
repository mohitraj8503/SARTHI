import { PrismaClient } from '@prisma/client';
import { buildCertificateHtmlSnapshot } from '../lib/certificate/captureCertificateSnapshot';
import { generateCertificateHash } from '../lib/certificates';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING CERTIFICATE SNAPSHOT BACKFILL ---');
  let updatedCount = 0;

  try {
    const certsToUpdate = await prisma.certificate.findMany({
      where: {
        htmlSnapshot: null
      },
      include: {
        user: true,
        course: true
      }
    });

    console.log(`Found ${certsToUpdate.length} legacy certificates missing htmlSnapshot...`);

    for (const cert of certsToUpdate) {
      if (!cert.user) {
        console.log(`Skipping ${cert.certificateNumber} — no associated user.`);
        continue;
      }

      let metadataObj: any = {};
      if (cert.metadata) {
        try {
          metadataObj = JSON.parse(cert.metadata as string);
        } catch(e) {}
      }

      const certTitle = cert.title || cert.course?.title || 'Professional Certification';
      
      // Do not manufacture a replacement heading from course_name.  That is
      // lossy for records issued before templateConfig was persisted and was
      // the source of the "course title as main title" production regression.
      if (!metadataObj.templateConfig?.mainTitle || metadataObj.templateConfig.subTitle === undefined) {
        console.log(`Skipping ${cert.certificateNumber} — original Studio templateConfig is missing; regenerate with the archived Studio fields.`);
        continue;
      }

      const htmlSnapshot = buildCertificateHtmlSnapshot({
        certificateNumber: cert.certificateNumber,
        studentName: cert.user.name || 'Student',
        courseName: certTitle,
        issueDate: cert.issuedAt.toLocaleDateString('en-GB'),
        userId: cert.userId,
        courseId: cert.courseId || undefined,
        templateConfig: metadataObj.templateConfig
      });

      await prisma.certificate.update({
        where: { id: cert.id },
        data: { htmlSnapshot }
      });

      console.log(`✅ Backfilled snapshot for: ${cert.certificateNumber} (${certTitle})`);
      updatedCount++;
    }

    console.log(`\n--- BACKFILL COMPLETE ---`);
    console.log(`Successfully updated ${updatedCount} certificates.`);

  } catch (err) {
    console.error('Error during backfill:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
