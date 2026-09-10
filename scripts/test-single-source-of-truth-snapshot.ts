import { prisma } from '../lib/prisma';
import { captureCertificateSnapshot, buildCertificateHtmlSnapshot } from '../lib/certificate/captureCertificateSnapshot';

async function runTests() {
  console.log('🧪 Starting Single Source of Truth HTML Snapshot Verification Test Suite...\n');

  const testCertId = `TT-SNAP-${Date.now().toString().slice(-6)}`;
  console.log(`1. Testing creation of PENDING_PAYMENT certificate: ${testCertId}...`);

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Snapshot Test Student',
        email: `snap_student_${Date.now()}@example.com`,
      }
    });
  }

  // Create PENDING_PAYMENT certificate
  const certPending = await prisma.certificate.create({
    data: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: user.id,
      title: 'Full Stack Web Development',
      status: 'PENDING_PAYMENT',
    }
  });

  console.log(`✓ Certificate created with status=${certPending.status}`);
  if (certPending.htmlSnapshot) {
    throw new Error('❌ FAILED: PENDING_PAYMENT certificate has exposed htmlSnapshot!');
  }
  console.log('✓ PASS: PENDING_PAYMENT certificate correctly has no htmlSnapshot.\n');

  // 2. Transition to VALID status & capture HTML snapshot
  console.log(`2. Activating certificate (status -> VALID) and capturing single-source HTML snapshot...`);
  const snapshotRes = await captureCertificateSnapshot({
    certificateNumber: testCertId,
    studentName: user.name || 'Snapshot Test Student',
    courseName: 'Full Stack Web Development',
    issueDate: '01.08.2026',
    userId: user.id
  });

  console.log(`✓ Captured HTML Snapshot length: ${snapshotRes.htmlSnapshot.length} characters.`);
  if (!snapshotRes.htmlSnapshot || !snapshotRes.htmlSnapshot.includes('Full Stack Web Development')) {
    throw new Error('❌ FAILED: htmlSnapshot does not contain required certificate content!');
  }
  console.log('✓ PASS: HTML snapshot captured successfully with complete markup.\n');

  // 3. Verify DB record contains byte-identical htmlSnapshot
  console.log(`3. Verifying DB record update for ${testCertId}...`);
  const certValid = await prisma.certificate.findUnique({
    where: { certificateNumber: testCertId }
  });

  if (certValid?.htmlSnapshot !== snapshotRes.htmlSnapshot) {
    throw new Error('❌ FAILED: DB htmlSnapshot does not match captured snapshot string!');
  }
  console.log('✓ PASS: DB record stores byte-identical htmlSnapshot string.\n');

  // 4. Test Regenerate Path
  console.log(`4. Testing explicit admin Regenerate action for ${testCertId}...`);
  const regenerated = await captureCertificateSnapshot({
    certificateNumber: testCertId,
    studentName: 'Snapshot Test Student (Corrected Name)',
    courseName: 'Full Stack Web Development (Mastery)',
    issueDate: '01.08.2026',
    userId: user.id
  });

  const certRegenerated = await prisma.certificate.findUnique({
    where: { certificateNumber: testCertId }
  });

  if (!certRegenerated?.htmlSnapshot?.includes('Full Stack Web Development (Mastery)')) {
    throw new Error('❌ FAILED: Regenerated htmlSnapshot missing updated title!');
  }
  console.log('✓ PASS: Explicit Regenerate action updated stored htmlSnapshot.\n');

  // Cleanup test record
  await prisma.certificate.delete({ where: { id: certPending.id } });
  console.log('✨ All Single Source of Truth HTML Snapshot tests PASSED successfully!');
  await prisma.$disconnect();
}

runTests().catch((err) => {
  console.error('❌ Verification test failed:', err);
  process.exit(1);
});
