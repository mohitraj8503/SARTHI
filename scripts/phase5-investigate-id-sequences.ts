import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('--- Investigating id_sequences_archived_20260731 ---');

  const rows: any = await prisma.$queryRawUnsafe(
    'SELECT * FROM `id_sequences_archived_20260731`'
  );
  console.log('Row content:', JSON.stringify(rows, null, 2));

  console.log('\nGrep search for IdSequence / id_sequences...');
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
          if (line.includes('IdSequence') || line.includes('id_sequences') || line.includes('idSequence')) {
            console.log(`${relPath}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }

  scanDir(rootDir);

  await prisma.$disconnect();
}

main().catch(console.error);
