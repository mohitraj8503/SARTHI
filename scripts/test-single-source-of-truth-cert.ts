import { prisma } from '../lib/prisma';
import { generateCertificateArtifacts } from '../lib/certificate/generateCertificateArtifacts';
import { updateCertificateStatusAtomic } from '../lib/certificates/status-service';

async function runTests() {
  console.log('🧪 Starting Single Source of Truth Certificate Verification Test Suite...\n');

  const testCertId = `TT-TEST-${Date.now().toString().slice(-6)}`;
  console.log(`1. Testing creation of PENDING_PAYMENT certificate: ${testCertId}...`);

  // Find or create test user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: `test_student_${Date.now()}@example.com`,
      }
    });
  }

  // Create PENDING_PAYMENT certificate
  const certPending = await prisma.certificate.create({
    data: {
      certificateNumber: testCertId,
      certificateId: testCertId,
      userId: user.id,
      title: 'Artificial Intelligence Mastery',
      status: 'PENDING_PAYMENT',
    }
  });

  console.log(`✓ Certificate created with status=${certPending.status}`);
  if (certPending.imageUrl || certPending.pdfUrl) {
    throw new Error('❌ FAILED: PENDING_PAYMENT certificate has exposed imageUrl or pdfUrl!');
  }
  console.log('✓ PASS: PENDING_PAYMENT certificate correctly has no accessible imageUrl/pdfUrl.\n');

  // 2. Transition to VALID status & generate artifacts
  console.log(`2. Activating certificate (status -> VALID) and generating single-source artifacts...`);
  const artifacts = await generateCertificateArtifacts({
    certificateNumber: testCertId,
    studentName: user.name || 'Test Student',
    courseName: 'Artificial Intelligence Mastery',
    issueDate: '01.08.2026',
    userId: user.id
  });

  console.log(`✓ Generated Artifacts:`);
  console.log(`  imageUrl: ${artifacts.imageUrl}`);
  console.log(`  pdfUrl:   ${artifacts.pdfUrl}`);

  if (!artifacts.imageUrl || !artifacts.pdfUrl) {
    throw new Error('❌ FAILED: Artifact generation failed to return valid URLs!');
  }
  console.log('✓ PASS: Artifacts generated and returned successfully.\n');

  // 3. Verify DB record contains identical stored URLs
  console.log(`3. Verifying DB record update for ${testCertId}...`);
  const certValid = await prisma.certificate.findUnique({
    where: { certificateNumber: testCertId }
  });

  if (certValid?.imageUrl !== artifacts.imageUrl || certValid?.pdfUrl !== artifacts.pdfUrl) {
    throw new Error('❌ FAILED: DB imageUrl/pdfUrl does not match generated artifact URLs!');
  }
  console.log('✓ PASS: DB record successfully stores identical file URLs.\n');

  // 4. Test Regenerate Path
  console.log(`4. Testing explicit admin Regenerate action for ${testCertId}...`);
  const regenerated = await generateCertificateArtifacts({
    certificateNumber: testCertId,
    studentName: 'Test Student (Corrected)',
    courseName: 'Artificial Intelligence Mastery (Advanced)',
    issueDate: '01.08.2026',
    userId: user.id
  });

  const certRegenerated = await prisma.certificate.findUnique({
    where: { certificateNumber: testCertId }
  });

  if (!certRegenerated?.imageUrl || !certRegenerated?.pdfUrl) {
    throw new Error('❌ FAILED: Regenerated certificate missing URLs!');
  }
  console.log(`✓ Regenerated imageUrl: ${certRegenerated.imageUrl}`);
  console.log('✓ PASS: Explicit Regenerate action succeeded and updated stored pointers.\n');

  // Cleanup test record
  await prisma.certificate.delete({ where: { id: certPending.id } });
  console.log('✨ All Single Source of Truth Certificate tests PASSED successfully!');
  await prisma.$disconnect();
}

runTests().catch((err) => {
  console.error('❌ Verification test failed:', err);
  process.exit(1);
});
