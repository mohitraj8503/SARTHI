import { prisma } from '../lib/prisma';
import { captureCertificateSnapshot } from '../lib/certificate/captureCertificateSnapshot';
import { getCertificateDisplayState } from '../lib/certificate/getCertificateDisplayState';

async function runMasterTest() {
  console.log('🏆 Running ATOOT KADI Master End-to-End Test Suite...\n');

  const testCertId = `TT-ATOOT-${Date.now().toString().slice(-6)}`;
  console.log(`1. Testing Certificate Creation & Initial Status: ${testCertId}...`);

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { name: 'Atoot Student', email: `atoot_${Date.now()}@example.com` }
    });
  }

  // 1. Pending payment test
  const certPending = await prisma.certificate.create({
    data: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: user.id,
      title: 'Master Certificate Chain Test',
      status: 'PENDING_PAYMENT'
    }
  });

  const statePending = getCertificateDisplayState(certPending);
  console.log(`✓ getCertificateDisplayState(PENDING_PAYMENT):`);
  console.log(`  isValid: ${statePending.isValid}`);
  console.log(`  isPendingPayment: ${statePending.isPendingPayment}`);
  console.log(`  canDisplaySnapshot: ${statePending.canDisplaySnapshot}`);

  if (statePending.canDisplaySnapshot || statePending.isValid) {
    throw new Error('❌ FAILED: getCertificateDisplayState exposed PENDING_PAYMENT certificate!');
  }
  console.log('✓ PASS: PENDING_PAYMENT status correctly blocked.\n');

  // 2. Status -> VALID and Snapshot Capture
  console.log(`2. Activating Certificate (status -> VALID) and capturing single-source snapshot...`);
  await prisma.certificate.update({
    where: { certificateNumber: testCertId },
    data: { status: 'VALID' }
  });

  const snapshotResult = await captureCertificateSnapshot({
    certificateNumber: testCertId,
    studentName: user.name || 'Atoot Student',
    courseName: 'Master Certificate Chain Test',
    issueDate: '01.08.2026',
    userId: user.id
  });

  const certValid = await prisma.certificate.findUnique({
    where: { certificateNumber: testCertId }
  });

  const stateValid = getCertificateDisplayState(certValid);
  console.log(`✓ getCertificateDisplayState(VALID):`);
  console.log(`  isValid: ${stateValid.isValid}`);
  console.log(`  canDisplaySnapshot: ${stateValid.canDisplaySnapshot}`);
  console.log(`  canDownloadPdf: ${stateValid.canDownloadPdf}`);

  if (!stateValid.canDisplaySnapshot || !stateValid.canDownloadPdf) {
    throw new Error('❌ FAILED: Valid certificate missing snapshot or PDF display state!');
  }
  console.log('✓ PASS: Valid certificate display state verified.\n');

  // 3. Cleanup
  await prisma.certificate.delete({ where: { id: certPending.id } });
  console.log('✨ ATOOT KADI Master End-to-End Test Suite PASSED 100%!');
  await prisma.$disconnect();
}

runMasterTest().catch((err) => {
  console.error('❌ Master Test Suite Failed:', err);
  process.exit(1);
});
