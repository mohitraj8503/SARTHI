import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

const PASCALCASE_TABLES = [
  { model: 'ActivityLog', currentTable: 'ActivityLog', newTable: 'activity_log_archived_20260731' },
  { model: 'LiveAttendance', currentTable: 'LiveAttendance', newTable: 'live_attendance_archived_20260731' },
  { model: 'RecordingAnalytics', currentTable: 'RecordingAnalytics', newTable: 'recording_analytics_archived_20260731' },
  { model: 'Streak', currentTable: 'Streak', newTable: 'streak_archived_20260731' },
  { model: 'XPTransaction', currentTable: 'XPTransaction', newTable: 'xp_transaction_archived_20260731' }
];

async function main() {
  console.log('--- Step 3: Archiving Remaining 5 PascalCase Tables ---\n');

  for (const item of PASCALCASE_TABLES) {
    console.log(`Auditing ${item.currentTable}...`);

    // Check if table exists under current name or new name
    const checkCurrent: any = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '${item.currentTable}'`
    );
    const existsCurrent = Number(BigInt(checkCurrent[0]?.count || 0)) > 0;

    const checkNew: any = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = '${item.newTable}'`
    );
    const existsNew = Number(BigInt(checkNew[0]?.count || 0)) > 0;

    let tableNameToQuery = existsCurrent ? item.currentTable : existsNew ? item.newTable : null;

    if (!tableNameToQuery) {
      console.log(`⚠️ Table ${item.currentTable} not found in database.`);
      continue;
    }

    const countRes: any = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM \`${tableNameToQuery}\``
    );
    const count = Number(BigInt(countRes[0]?.count || 0));

    const checksumRes: any = await prisma.$queryRawUnsafe(
      `CHECKSUM TABLE \`${tableNameToQuery}\``
    );
    const checksum = checksumRes[0]?.Checksum?.toString() || '0';

    console.log(`- Pre-Archival Status for \`${tableNameToQuery}\`: Row Count = ${count}, Checksum = ${checksum}`);

    if (existsCurrent) {
      console.log(`Renaming \`${item.currentTable}\` -> \`${item.newTable}\`...`);
      await prisma.$executeRawUnsafe(
        `RENAME TABLE \`${item.currentTable}\` TO \`${item.newTable}\``
      );
      console.log(`✓ Table renamed to \`${item.newTable}\``);
    } else {
      console.log(`✓ Table \`${item.newTable}\` is already renamed.`);
    }

    // Verify post-rename
    const postCountRes: any = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM \`${item.newTable}\``
    );
    const postCount = Number(BigInt(postCountRes[0]?.count || 0));
    console.log(`- Post-Archival Status for \`${item.newTable}\`: Row Count = ${postCount} (Matches: ${count === postCount})\n`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
