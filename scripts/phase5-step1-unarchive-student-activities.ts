import { prisma } from '../lib/prisma';

async function main() {
  console.log('--- Step 1: Un-archiving student_activities ---');
  try {
    await prisma.$executeRawUnsafe(
      'RENAME TABLE `student_activities_archived_20260731` TO `student_activities`'
    );
    console.log('✓ Successfully renamed `student_activities_archived_20260731` to `student_activities`');
  } catch (err: any) {
    if (err.message?.includes("Table 'student_activities' already exists")) {
      console.log('✓ Table `student_activities` already renamed.');
    } else {
      console.error('❌ Error renaming table:', err);
    }
  }

  const countResult: any = await prisma.$queryRawUnsafe(
    'SELECT COUNT(*) as count FROM `student_activities`'
  );
  console.log(`✓ Live table student_activities row count: ${BigInt(countResult[0]?.count || 0).toString()}`);

  await prisma.$disconnect();
}

main().catch(console.error);
