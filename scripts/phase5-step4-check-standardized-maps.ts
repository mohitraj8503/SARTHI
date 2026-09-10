import { prisma } from '../lib/prisma';

const STANDARDIZED_TABLES = [
  'course_youtube_mappings',
  'metric_overrides',
  'payment_intents',
  'profiles',
  'projects',
  'project_interests',
  'study_groups',
  'thumbnails',
  'transcriptions',
  'unmatched_queries'
];

async function main() {
  console.log('--- Step 4: Verifying Standardized Map Tables in Database ---');

  for (const table of STANDARDIZED_TABLES) {
    try {
      const res: any = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM \`${table}\``
      );
      const count = BigInt(res[0]?.count || 0).toString();
      console.log(`✓ Physical table \`${table}\` exists with ${count} rows.`);
    } catch (err: any) {
      console.error(`❌ Table \`${table}\` check failed:`, err.message);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
