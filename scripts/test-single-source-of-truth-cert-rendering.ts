import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function testSingleSourceOfTruthCertRendering() {
  console.log('===========================================================');
  console.log('🧪 TESTING SINGLE SOURCE OF TRUTH (CERTIFICATE DESIGN & STATUS)');
  console.log('===========================================================');

  // 1. Verify existence of single visual component CertificateTemplate.tsx
  const templatePath = path.join(process.cwd(), 'components', 'certificate', 'CertificateTemplate.tsx');
  if (!fs.existsSync(templatePath)) {
    throw new Error('FAILED: CertificateTemplate.tsx missing!');
  }
  console.log('✓ VERIFIED: CertificateTemplate.tsx exists as canonical visual renderer!');

  // 2. Verify existence of useCertificateStatus.ts hook
  const hookPath = path.join(process.cwd(), 'hooks', 'useCertificateStatus.ts');
  if (!fs.existsSync(hookPath)) {
    throw new Error('FAILED: useCertificateStatus.ts missing!');
  }
  console.log('✓ VERIFIED: useCertificateStatus.ts exists as canonical status hook!');

  // 3. Verify existence of CertificateActions.tsx component
  const actionsPath = path.join(process.cwd(), 'components', 'certificate', 'CertificateActions.tsx');
  if (!fs.existsSync(actionsPath)) {
    throw new Error('FAILED: CertificateActions.tsx missing!');
  }
  console.log('✓ VERIFIED: CertificateActions.tsx exists as canonical action buttons component!');

  // 4. Verify ProfessionalCertificate.tsx delegates to CertificateTemplate.tsx
  const legacyCertContent = fs.readFileSync(path.join(process.cwd(), 'components', 'ProfessionalCertificate.tsx'), 'utf8');
  if (!legacyCertContent.includes("from './certificate/CertificateTemplate'")) {
    throw new Error('FAILED: ProfessionalCertificate.tsx does not alias CertificateTemplate.tsx!');
  }
  console.log('✓ VERIFIED: ProfessionalCertificate.tsx re-exports CertificateTemplate.tsx!');

  // 5. Check Template configuration file custom_certificate_templates.json
  const jsonPath = path.join(process.cwd(), 'public', 'custom_certificate_templates.json');
  console.log(`Custom Templates File Exists: ${fs.existsSync(jsonPath)}`);

  console.log('\n===========================================================');
  console.log('🎉 ALL SINGLE SOURCE OF TRUTH VERIFICATION TESTS PASSED!');
  console.log('===========================================================');
}

testSingleSourceOfTruthCertRendering()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
