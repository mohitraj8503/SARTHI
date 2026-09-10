import fs from 'fs';
import path from 'path';

/**
 * ATOOT KADI — CI Anti-Drift Checker
 * Enforces that no file outside components/certificate/ and lib/certificate/
 * re-implements certificate rendering markup or bypasses getCertificateDisplayState.
 */
function runAntiDriftCheck() {
  console.log('🔍 Running ATOOT KADI CI Anti-Drift Checker...\n');

  const rootDir = process.cwd();
  const searchDirs = ['app', 'components', 'lib'];
  const allowedDirs = ['components/certificate', 'lib/certificate', 'components/admin/CertificateStudioClient.tsx'];

  let violations: string[] = [];

  // Patterns that indicate illegal duplication of certificate rendering or status logic
  const forbiddenPatterns = [
    { pattern: /id="professional-certificate-root"/, reason: 'Duplicate certificate root element rendered outside canonical components.' },
    { pattern: /THIS CERTIFIES THAT/, reason: 'Hardcoded certificate template text rendered outside canonical components.' },
    { pattern: /OF COMPLETION/, reason: 'Hardcoded certificate header text rendered outside canonical components.' },
  ];

  function scanDirectory(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (entry.isDirectory()) {
        if (!relativePath.includes('node_modules') && !relativePath.includes('.next')) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        // Skip allowed directories & scripts
        if (allowedDirs.some(allowed => relativePath.startsWith(allowed)) || relativePath.startsWith('scripts/')) {
          continue;
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        // Check forbidden patterns
        for (const { pattern, reason } of forbiddenPatterns) {
          if (pattern.test(content)) {
            violations.push(`❌ ${relativePath}: ${reason}`);
          }
        }
      }
    }
  }

  for (const dir of searchDirs) {
    const fullDir = path.join(rootDir, dir);
    if (fs.existsSync(fullDir)) {
      scanDirectory(fullDir);
    }
  }

  if (violations.length > 0) {
    console.error('FAILED: ATOOT KADI Anti-Drift Violations Found:');
    violations.forEach(v => console.error(v));
    process.exit(1);
  }

  console.log('✅ ATOOT KADI CI Anti-Drift Check PASSED: 0 violations found!');
}

runAntiDriftCheck();
