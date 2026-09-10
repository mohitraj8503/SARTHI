import { execSync } from 'child_process';
import path from 'path';

const seedScripts = [
  'seed-ftw-project.ts',
  'seed-laxido-project.ts',
  'seed-presencex-project.ts',
  'seed-hercare-project.ts',
  'seed-msme-project.ts',
  'seed-git-masterclass-project.ts',
  'seed-kerala-health-project.ts',
];

console.log('🚀 Starting Master Database Seeding for Industry-Ready Projects...\n');

for (const script of seedScripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`📡 Running: ${script}...`);
  try {
    const output = execSync(`npx tsx "${scriptPath}"`, { encoding: 'utf8' });
    console.log(output);
    console.log(`✅ Success: ${script}\n`);
  } catch (error: any) {
    console.error(`❌ Error running ${script}:`, error.message);
  }
}

console.log('🎉 All projects successfully seeded!');
