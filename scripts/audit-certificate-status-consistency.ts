import { prisma } from '../lib/prisma';
import { updateCertificateStatusAtomic } from '../lib/certificates/status-service';

async function auditCertificateStatusConsistency() {
  console.log('===========================================================');
  console.log('🔍 RUNNING CERTIFICATE DUAL-MODEL STATUS CONSISTENCY AUDIT');
  console.log('===========================================================');

  const allCertificates = await prisma.certificate.findMany();
  const allIssuedCertificates = await prisma.issuedCertificate.findMany();

  console.log(`Auditing ${allCertificates.length} 'Certificate' rows and ${allIssuedCertificates.length} 'IssuedCertificate' rows...`);

  let auditedMatches = 0;
  let driftCount = 0;
  let healedCount = 0;

  for (const issued of allIssuedCertificates) {
    // Find matching Certificate row
    const matchingCert = allCertificates.find(
      (c) => c.certificateNumber === issued.verificationId || c.id === issued.verificationId || (c.userId === issued.userId && c.courseId === issued.certificationId)
    );

    if (matchingCert) {
      auditedMatches++;

      if (issued.status !== matchingCert.status) {
        driftCount++;
        console.warn(`\n⚠️ DISCREPANCY DETECTED:`);
        console.warn(`  IssuedCertificate ID: ${issued.verificationId} -> status: '${issued.status}'`);
        console.warn(`  Certificate ID: ${matchingCert.certificateNumber} -> status: '${matchingCert.status}'`);

        // Authoritative resolution: if either is VALID, status should be VALID. Otherwise prioritize issued.status
        const authoritativeStatus = (issued.status === 'VALID' || matchingCert.status === 'VALID') ? 'VALID' : (issued.status as any);

        console.log(`  Auto-healing both models to authoritative status: '${authoritativeStatus}'...`);
        await updateCertificateStatusAtomic({
          verificationId: issued.verificationId,
          userId: issued.userId,
          certificationId: issued.certificationId,
          status: authoritativeStatus,
          razorpayOrderId: issued.razorpayOrderId,
          razorpayPaymentId: issued.razorpayPaymentId
        });
        healedCount++;
      }
    }
  }

  console.log('\n===========================================================');
  console.log('📊 DUAL-MODEL CONSISTENCY AUDIT REPORT');
  console.log('===========================================================');
  console.log(`Matched Dual-Model Records Audited: ${auditedMatches}`);
  console.log(`Discrepancies Found: ${driftCount}`);
  console.log(`Discrepancies Auto-Healed: ${healedCount}`);
  console.log('===========================================================');
}

auditCertificateStatusConsistency()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
