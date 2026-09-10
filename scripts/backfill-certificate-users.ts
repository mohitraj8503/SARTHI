import { prisma } from '../lib/prisma';

/**
 * Backfill & Data Integrity Verification Script for Certificates
 * Verifies that all Certificate rows have valid studentId/userId foreign keys referencing real User records.
 */
async function backfillCertificateUsers() {
  console.log('--- Starting Certificate User Foreign Key Audit & Backfill ---');

  const certificates = await prisma.certificate.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          enrollmentNumber: true,
          studentId: true
        }
      }
    }
  });

  console.log(`Found ${certificates.length} total Certificate records in database.`);

  let validCount = 0;
  let fixedCount = 0;
  let unresolvableCount = 0;

  for (const cert of certificates) {
    if (cert.user) {
      validCount++;
      console.log(`✓ Cert ${cert.certificateNumber || cert.id} -> User ID: ${cert.userId} (${cert.user.name || cert.user.email})`);
    } else {
      console.warn(`⚠️ Cert ${cert.certificateNumber || cert.id} has invalid/unlinked userId: "${cert.userId}"`);

      // Try resolving by enrollmentId or metadata.enrollment_id
      let searchKey = cert.enrollmentId;
      if (!searchKey && cert.metadata) {
        try {
          const meta = JSON.parse(cert.metadata);
          searchKey = meta.enrollment_id;
        } catch (e) {}
      }

      if (searchKey) {
        const matchedUser = await prisma.user.findFirst({
          where: {
            OR: [
              { enrollmentNumber: searchKey },
              { studentId: searchKey },
              { id: searchKey }
            ]
          }
        });

        if (matchedUser) {
          await prisma.certificate.update({
            where: { id: cert.id },
            data: { userId: matchedUser.id }
          });
          fixedCount++;
          console.log(`  -> Auto-resolved and updated to User ID: ${matchedUser.id} (${matchedUser.name || matchedUser.email})`);
        } else {
          unresolvableCount++;
          console.error(`  -> Unresolvable search key: "${searchKey}". Needs manual review.`);
        }
      } else {
        unresolvableCount++;
        console.error(`  -> No enrollment key stored. Needs manual review.`);
      }
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total Certificates: ${certificates.length}`);
  console.log(`Valid Foreign Key Relations: ${validCount}`);
  console.log(`Auto-fixed Relations: ${fixedCount}`);
  console.log(`Unresolvable Records: ${unresolvableCount}`);
}

backfillCertificateUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  });
