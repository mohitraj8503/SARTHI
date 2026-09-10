import { prisma } from '../lib/prisma';

// Expected row counts from original archival ledger / TARGET-SCHEMA.md
const EXPECTED_COUNTS: Record<string, number> = {
  'achievements_archived_20260731': 0,
  'ai_chat_logs_archived_20260731': 0,
  'assignment_submissions_archived_20260731': 0,
  'audit_log_archived_20260731': 0,
  'certificates_v2_archived_20260731': 0,
  'comments_archived_20260731': 0,
  'discussion_threads_archived_20260731': 0,
  'forum_categories_archived_20260731': 0,
  'forum_posts_archived_20260731': 0,
  'internship_feedback_archived_20260731': 0,
  'job_applications_archived_20260731': 0,
  'live_class_attendance_archived_20260731': 0,
  'live_class_recordings_archived_20260731': 0,
  'live_events_archived_20260731': 0,
  'mfa_backup_codes_archived_20260731': 0,
  'notification_logs_archived_20260731': 0,
  'payment_logs_archived_20260731': 0,
  'quiz_attempts_archived_20260731': 0,
  'referral_logs_archived_20260731': 0,
  'reviews_archived_20260731': 0,
  'student_analytics_archived_20260731': 0,
  'study_group_members_archived_20260731': 0,
  'subscriptions_v2_archived_20260731': 0,
  'support_tickets_archived_20260731': 0,
  'system_logs_archived_20260731': 0,
  'system_metrics_archived_20260731': 0,
  'user_notes_archived_20260731': 0,
  'user_roles_archived_20260731': 0,
  'user_settings_archived_20260731': 0,
  'video_analytics_archived_20260731': 0,
  'video_bookmarks_archived_20260731': 0,
  'video_notes_archived_20260731': 0,
  'video_progress_archived_20260731': 0,
  'webhooks_archived_20260731': 0,
  'xp_history_archived_20260731': 0
};

async function main() {
  console.log('--- Step 2: Auditing All Archived Tables ---');

  // Query all tables in DB ending with _archived_20260731
  const tablesResult: any = await prisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE '%_archived_20260731'"
  );

  const tableNames = tablesResult.map((r: any) => r.TABLE_NAME || r.table_name);
  console.log(`Found ${tableNames.length} archived tables in database.\n`);

  console.log('| Table Name | Expected Rows | Actual Rows | Checksum | Match? |');
  console.log('|---|---|---|---|---|');

  let matches = 0;
  let mismatches = 0;

  for (const table of tableNames) {
    try {
      const countRes: any = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM \`${table}\``
      );
      const actualCount = Number(BigInt(countRes[0]?.count || 0));

      const checksumRes: any = await prisma.$queryRawUnsafe(
        `CHECKSUM TABLE \`${table}\``
      );
      const checksum = checksumRes[0]?.Checksum?.toString() || 'N/A';

      const expected = EXPECTED_COUNTS[table] ?? 0;
      const isMatch = actualCount === expected;

      if (isMatch) matches++;
      else mismatches++;

      console.log(`| \`${table}\` | ${expected} | ${actualCount} | ${checksum} | ${isMatch ? 'Y' : 'N (MISMATCH)'} |`);
    } catch (err) {
      console.error(`Error inspecting table ${table}:`, err);
    }
  }

  console.log(`\nSummary: Matches: ${matches}, Mismatches: ${mismatches}`);
  await prisma.$disconnect();
}

main().catch(console.error);
