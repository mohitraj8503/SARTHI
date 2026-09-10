import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function step1InvestigateStudentActivities() {
  console.log('--- Step 1: Investigating student_activities_archived_20260731 ---\n');

  // 1. Query count & checksum from database
  try {
    const countResult: any = await prisma.$queryRawUnsafe(
      'SELECT COUNT(*) as count FROM `student_activities_archived_20260731`'
    );
    const count = BigInt(countResult[0]?.count || 0).toString();

    const checksumResult: any = await prisma.$queryRawUnsafe(
      'CHECKSUM TABLE `student_activities_archived_20260731`'
    );
    const checksum = checksumResult[0]?.Checksum?.toString() || 'N/A';

    console.log(`Row Count: ${count}`);
    console.log(`Checksum:  ${checksum}\n`);

    // 2. Fetch sample rows (5-10)
    const sampleRows: any = await prisma.$queryRawUnsafe(
      'SELECT * FROM `student_activities_archived_20260731` LIMIT 10'
    );
    console.log('Sample Rows (up to 10):');
    console.log(JSON.stringify(sampleRows, null, 2));

  } catch (err) {
    console.error('Error querying student_activities_archived_20260731:', err);
  }

  // 3. Grep codebase for studentActivity / student_activities
  console.log('\n--- Codebase Grep Search Results ---');
  const searchPatterns = ['studentActivity', 'student_activities', 'studentActivities'];
  const rootDir = process.cwd();
  
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(rootDir, fullPath);
      if (entry.isDirectory()) {
        if (!relPath.includes('node_modules') && !relPath.includes('.next') && !relPath.includes('.git')) {
          scanDir(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.prisma'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          for (const pattern of searchPatterns) {
            if (line.includes(pattern)) {
              console.log(`${relPath}:${idx + 1}: ${line.trim()}`);
            }
          }
        });
      }
    }
  }

  scanDir(rootDir);

  await prisma.$disconnect();
}

step1InvestigateStudentActivities().catch((err) => {
  console.error('Fatal error in Step 1:', err);
  process.exit(1);
});
