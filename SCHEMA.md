# SARTHI Database Schema Architecture

**Database:** `u402587352_sarthi` (MySQL on Hostinger)  
**ORM:** Prisma Client with `relationMode = "prisma"`  
**Last Updated:** September 10, 2026  

---

## 1. Architectural Rules & Naming Conventions

### Non-Negotiable Table Naming Rules
1. **Lowercase `snake_case` only:** All table names must be lowercase and pluralized (e.g., `users`, `course_certificates`, `internship_applications`).
2. **No Version Suffixes (`_v2`, `_v3`):** Never append version numbers to table names in production. If a table evolves, alter its columns or run a phased migration. All previous `_v2` tables have been consolidated (`certifications`, `certification_attempts`, `certification_payments`, `certification_registrations`, `issued_certificates`).
3. **Standardized Archiving Convention:** If a table must be archived before a breaking overhaul, use prefix syntax:
   - Format: `archive_<table_name>_<YYYYMMDD>` (e.g. `archive_legacy_orders_20260910`)
   - Never use postfix suffixes (`*_archived_*`) as it causes model naming confusion.
4. **Application-Enforced Integrity:** Because `relationMode = "prisma"` is configured, MySQL foreign key constraints (`KEY_COLUMN_USAGE`) are not enforced at engine level. Always ensure cascade deletes, indexes, and referential integrity are defined on Prisma relations.
5. **Pre-Migration Safety Checklist:**
   - Always take an atomic SQL dump of affected tables into `backups/` before any ALTER or RENAME.
   - Verify that row count in the new table matches the old table before dropping anything.
   - Check application code references (`grep`) across `app/`, `lib/`, and `components/` before dropping 0-row tables.

---

## 2. Domain-Wise Table Architecture

### Domain A: Certificates & Credentials
- **`certificates`**: LMS / regular course completion certificates (e.g., `TT-FSWDM-2026-000001`).
- **`internship_certificates`**: Official SARTHI internship completion letters (`TT-INT-2026-XXXX`) and special awards (`TT-BIA-2026-XX`).
- **`issued_certificates`**: Certificates issued to students who pass online Certification Exams (e.g., Python Professional Developer `TT-PY-PRO-*`, Advanced Excel `TT-AEX-C-*`). Stores rendered `htmlSnapshot`.
- **`user_certifications`**: Metadata index of exam certifications awarded to users (`certNumber`, `certificateHash`, `issuedAt`).
- **`achievement_certificates`**: Certificates awarded for Olympiads and academic competitions.

### Domain B: Certification Exam Engine
- **`certifications`**: Exam track definitions, pricing, passing score, and duration (e.g., Full Stack Dev, Advanced Excel).
- **`certification_questions`**: Question bank (MCQs with options, explanations, difficulty).
- **`certification_attempts`**: Student exam session submissions, scores, and pass/fail statuses.
- **`certification_payments`**: Razorpay transaction logs for paid certification exams.
- **`certification_registrations`**: Candidate registrations for upcoming certification examination dates.
- **`certification_module_progress`**: Granular progress per module within certification learning paths.

### Domain C: Internships & Induction
- **`internships`**: Main internship program offerings.
- **`internship_batches`**: Cohort / batch management.
- **`batch_members`**: Roster of active and historical interns linked to batches.
- **`internship_applications`**: Candidate applications submitted through the portal.
- **`internship_assignments`**: Domain-specific tasks and weekly problem statements.
- **`internship_assignment_recipients`**: Mapping of assignments distributed to interns.
- **`internship_submissions`**: Code and project deliverables submitted by interns.
- **`submission_versions`**: Iterative submission tracking and mentor feedback.
- **`internship_attendances`**: Daily/weekly attendance logs for interns.
- **`internship_track_configs`**: Track-specific settings and curriculum guidelines.
- **`internship_settings`**: Global configuration toggles for the internship portal.
- **`managed_interns`**: Mentorship assignment mappings.
- **`rejected_applicants`**: Archive of rejected internship candidate entries.

### Domain D: Users, Authentication & Profiles
- **`users`**: Core user accounts (Students, Mentors, Teachers, Admins).
- **`sessions` / `user_sessions`**: User login sessions.
- **`verification_tokens`**: Email verification tokens.
- **`education_entries`**: Educational background and university records.
- **`daily_check_ins`**: Daily student check-ins and streak logs.

### Domain E: Courses & LMS
- **`courses`**: Course catalog (Full Stack, Python, etc.).
- **`lessons`**: Individual video and interactive lessons.
- **`enrollments`**: Course enrollment records connecting users to courses.
- **`categories`**: Taxonomy and categorization of courses.
- **`projects`**: Guided course projects and capstones.

### Domain F: Communications & Real-Time
- **`conversations`**: Chat conversation threads.
- **`conversation_participants`**: Users involved in each chat conversation.
- **`notifications`**: System and user notifications.

### Domain G: System Counters & Telemetry
- **`id_sequences`**: Atomic sequence generator table (`role`, `year`, `lastNumber`).
- **`system_counters`**: General atomic counter table for sequential IDs (`TT-STU-XXXX`).
- **`security_events`**: Audit trail of authentication, login attempts, and security incidents.
- **`platform_activities`**: Global platform audit telemetry.
- **`activity_logs`**: Platform activity stream, admin notifications, and high-level activity logs.
- **`streaks`**: User daily learning activity and streak records.
- **`live_session_messages`**: Real-time chat messages during live webinars and classes.
- **`live_attendance`**: Attendance logs for live class sessions.
- **`user_xp_transactions`**: XP and gamification point ledger for individual students/users.
- **`xp_transactions`**: XP points awarded to internship batch members (`BatchMember`).

---

## 3. Database Cleanup Changelog (September 10, 2026)

1. **V2 Suffixes Removed:**
   - `certifications_v2` → `certifications` (13 rows)
   - `certification_attempts_v2` → `certification_attempts` (9 rows)
   - `certification_payments_v2` → `certification_payments` (21 rows)
   - `certification_registrations_v2` → `certification_registrations` (5 rows)
   - `issued_certificates_v2` → `issued_certificates` (17 rows)
2. **Archived Live Tables Restored to Canonical Names:**
   - `id_sequences_archived_20260731` → `id_sequences` (1 row)
   - `activity_log_archived_20260731` → `activity_logs`
   - `live_session_messages_archived_20260731` → `live_session_messages`
   - `live_attendance_archived_20260731` → `live_attendance`
   - `streak_archived_20260731` → `streaks`
   - `xp_transaction_archived_20260731` → `user_xp_transactions`
3. **Dead Tables Dropped (36 Tables with 0 rows and 0 code references):**
   - 29 truly abandoned archived tables (e.g. `admin_cache_*`, `weekly_reports_*`, `course_videos_*`)
   - 6 unused dead tables (`marketing_notifications`, `marketing_sales`, `squads`, `squad_members`, `subscription_payments`, `_StudyGroupMembers`)
   - 1 unused certificate stub (`certificate_otps`)
   - *All backed up in `backups/backup_dead_tables_20260910.sql` prior to dropping.*
4. **Table Count Reduced:** **227 tables → 191 tables** (36 dead tables eliminated).
5. **Users Table Base64 Bloat Elimination & Optimization:**
   - Identified 10 users storing raw Base64 image payloads in `image` and `avatar_url` (accounting for ~17.55 MB bloat).
   - Raw Base64 payloads fully backed up to `backups/raw_base64_avatars_backup.json`.
   - All 10 avatars extracted, verified, and saved to `/public/uploads/profile-photos/profile-<userId>.<ext>`.
   - Database updated to store clean relative paths (`/uploads/profile-photos/...`). Zero Base64 strings remain in MySQL.
   - Ran `OPTIMIZE TABLE users` to reclaim InnoDB pages: `DATA_LENGTH` reduced from **24.6 MB (24,641,536 bytes) to 112 KB (114,688 bytes)** — **99.5% reduction**.
   - Implemented leak prevention via `lib/upload-profile-photo.ts` across `app/actions/profile.ts` and `app/api/auth/update-profile/route.ts` to automatically intercept and persist Base64 uploads directly to disk.
6. **Additional Dead Tables Dropped (3 Tables with 0 rows and 0 code references):**
   - `student_counter` (`StudentCounter` model): Superseded by atomic `id_sequences` and `system_counters`.
   - `study_groups` (`StudyGroup`, `_StudyGroupMembers`): Abandoned social learning feature.
   - `transcriptions` (`Transcription` model): Unused video transcription table.
   - *Backed up in `backups/backup_3_dead_tables_20260910.json` prior to dropping.*
   - **Current Base Tables in MySQL:** **191 tables → 188 tables**.
7. **Users Table Dead Columns Removed (4 Columns):**
   - Dropped unused Stripe and legacy columns with 0 rows and 0 code usage: `stripeCustomerId`, `stripeAccountId`, `seminarPreferences`, `lockUntil`.
   - *Backed up in `backups/backup_users_dropped_cols_20260910.json` prior to dropping.*
8. **Verification System Resilient Architecture:**
   - Deployed 11 backward-compatibility MySQL VIEWs (`issued_certificates_v2`, `certifications_v2`, etc.) ensuring zero downtime across deployments.
   - Refactored `/verify/[id]` with deterministic prefix routing (`TT-FSWDM-*` → course `certificates`, `TT-INT-*` / `TT-BIA-*` → `internship_certificates`, `TT-PY-*` / `TT-AEX-*` / `TT-EX-*` → `issued_certificates`).
   - All verification queries wrapped in `safeQuery` timeouts and try-catch blocks to prevent 500 runtime crashes.
   - Added `internship_certificates` lookup to `/api/certificates/verify` for complete parity across public APIs.
   - Fixed iframe sandbox permissions (`allow-scripts allow-same-origin allow-popups`) eliminating console execution errors.
9. **Production Zero-Downtime & Compatibility Restoration:**
   - **Auth & Login Recovery:** When `stripeCustomerId`, `stripeAccountId`, `seminarPreferences`, and `lockUntil` were dropped prior to production deployment, the running production build (which was compiled with the earlier Prisma client) attempted to query those fields on `prisma.user.findUnique`, causing `1054: Unknown column 'stripeCustomerId' in 'field list'` and triggering `/login?error=auth_failed`. Columns have been restored in MySQL with zero downtime so both legacy running builds and future builds execute without friction.
   - **Mentor Dashboard Recovery:** `lib/services/mentor.service.ts` queried `internshipBatch` with relation `assignments.resources`, which maps to `internship_resources`. Recreated `internship_resources` table and established compatibility view `internship_resources_archived_20260731`. Updated Prisma model `InternshipResource` to canonical `@@map("internship_resources")`.
   - **Legacy Tables Preserved for Build Parity:** `student_counter`, `study_groups`, and `transcriptions` restored to ensure 100% backward compatibility with running server processes until next deploy cycle.
