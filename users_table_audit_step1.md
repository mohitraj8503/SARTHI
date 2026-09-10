# Users Table Deep Audit — Step 1 Report (Read-Only)

**Database:** `u402587352_sarthi`  
**Table:** `users`  
**Rows:** 158  
**Data Length:** ~24.06 MB (24,641,536 bytes)  
**Index Length:** ~224 KB (229,376 bytes)  
**Average Row Length:** 161,055 bytes (~161 KB/row)  
**Total Columns:** 68  
**Prisma Mode:** `relationMode = "prisma"`  
**Prisma User Relations:** 123 related models  

---

## 1. Storage Analysis: Why is Users 24 MB for Only 158 Rows?

| Column | Data Type | Populated Rows | Total Payload Size | Culprit / Root Cause |
|---|---|---|---|---|
| `image` | `LONGTEXT` | 91 | **7.88 MB** | Raw Base64 data strings (`data:image/...;base64`) stored directly in DB instead of CDN URLs. |
| `avatar_url` | `LONGTEXT` | 89 | **9.67 MB** | Duplicate raw Base64 data strings stored directly in DB. |
| `bio` | `TEXT` | 4 | **1.89 KB** | Normal text. |
| `tempPassword` | `LONGTEXT` | 14 | **0.23 KB** | Temporary hash strings. |
| All other 64 columns | Various | - | **~250 KB** | Normal structured scalar data. |

> **Crucial Finding:** 17.55 MB out of 24 MB is purely caused by inline Base64 avatar images. InnoDB allocates 16 KB overflow pages for `LONGTEXT`, inflating table size to ~24 MB. Moving avatars to an object store / CDN and extracting profile columns into dedicated profile tables will reduce `users` table size by over 95%.

---

## 2. Role Distribution in `users`

| Role | Exact Row Count | Percentage |
|---|---|---|
| `STUDENT` | **142** | 89.87% |
| `INSTRUCTOR` | **9** | 5.70% |
| `ADMIN` | **3** | 1.90% |
| `ASSOCIATE` | **1** | 0.63% |
| `CLIENT` | **1** | 0.63% |
| `MENTOR` | **1** | 0.63% |
| `TEACHER` | **1** | 0.63% |
| **Total** | **158** | 100.0% |

### Junior Cohort Verification
- `SELECT DISTINCT role FROM users WHERE UPPER(role) LIKE '%JUNIOR%'` returns **`[]` (0 rows)**.
- `SELECT platformSegment, COUNT(*) FROM users GROUP BY platformSegment` returns **158 rows as `'MAIN'`**, 0 as `'JUNIOR'`.
- Dedicated junior tables already exist in the database: `junior_profiles` (0 rows), `junior_applications` (0 rows), `junior_opportunities` (0 rows), `junior_submissions` (0 rows), `junior_consent_tokens` (0 rows).
- In `schema.prisma`, `JuniorProfile` does not even link to `User.id`; it operates independently via `parentEmail` and `schoolId`.

---

## 3. Comprehensive Column Classification (All 68 Columns)

### Category A: Common Identity & Auth (14 Columns)
Essential for login, authentication, and core profile across all roles:
- `id` (VARCHAR(191), 100% populated)
- `email` (VARCHAR(191), 100% populated)
- `name` (VARCHAR(191), 98.7% populated)
- `password` (VARCHAR(191), 93.0% populated)
- `role` (VARCHAR(191), 100% populated)
- `status` (VARCHAR(191), 100% populated)
- `onboarded` (BOOLEAN, 100% populated)
- `onboardingStatus` (VARCHAR(191), 100% populated)
- `createdAt` (DATETIME(3), 100% populated)
- `updatedAt` (DATETIME(3), 100% populated)
- `lastActive` (DATETIME(3), 100% populated)
- `loginCount` (INT, 100% populated)
- `emailVerified` (DATETIME(3), 60.8% populated)
- `platformSegment` (ENUM, 100% populated)

### Category B: 100% Unused / Zero-Populated Columns (22 Columns)
These 22 columns have **0 populated rows** across the entire database:
1. `username` (VARCHAR(191))
2. `signatureUrl` (VARCHAR(191))
3. `privacySettings` (VARCHAR(191))
4. `stripeCustomerId` (VARCHAR(191))
5. `stripeAccountId` (VARCHAR(191))
6. `grade` (VARCHAR(191))
7. `youtubeAccessToken` (VARCHAR(191))
8. `youtubeRefreshToken` (VARCHAR(191))
9. `youtubeTokenExpiry` (VARCHAR(191))
10. `youtubeChannelId` (VARCHAR(191))
11. `youtubeChannelTitle` (VARCHAR(191))
12. `accessToken` (VARCHAR(191))
13. `refreshToken` (VARCHAR(191))
14. `failedLoginAttempts` (INT)
15. `lockUntil` (DATETIME(3))
16. `lastLogin` (DATETIME(3))
17. `twoFactorEnabled` (TINYINT(1))
18. `seminarPreferences` (VARCHAR(191))
19. `notificationSettings` (VARCHAR(191))
20. `blogWriterApprovedAt` (DATETIME(3))
21. `referredById` (VARCHAR(191))
22. `educationLevel` (ENUM)

### Category C: Student-Specific Fields (6 Columns)
Populated only in `STUDENT` rows; 0 in staff or admins:
- `avatar_version` (INT, populated in 6 student rows)
- `totalPoints` (INT, populated in 12 student rows — gamification points)
- `hasInternshipBadge` (BOOLEAN, populated in 2 student rows)
- `blogStrikes` (INT, populated in 1 student row)
- `blogTrustScore` (INT, populated in 4 student rows)
- `isBlogTrusted` (BOOLEAN, populated in 2 student rows)

### Category D: Teacher / Mentor-Specific Fields (4 Columns)
Populated only in instructor/teacher/mentor rows; 0 in regular students:
- `bio` (TEXT, populated in 4 instructors/teachers)
- `headline` (VARCHAR(191), populated in 2 instructors/teachers)
- `company` (VARCHAR(191), populated in 2 instructors/teachers)
- `passwordSetupExpires` (DATETIME(3), populated in 4 staff onboarding rows)

### Category E: Shared Partial Profile Fields (22 Columns)
Populated across students and some staff:
- `phone` (VARCHAR(191), 105 populated: 98 students, 6 instructors, 1 associate)
- `college` (VARCHAR(191), 106 populated: 101 students, 4 instructors, 1 associate)
- `currentCourse` (VARCHAR(191), 99 populated: 94 students, 4 instructors, 1 associate)
- `lastQualification` (VARCHAR(191), 80 populated: 75 students, 4 instructors, 1 associate)
- `enrollmentNumber` (VARCHAR(191), 52 populated: 50 students, 1 mentor, 1 instructor)
- `studentId` (VARCHAR(191), 35 populated: 31 students, 3 instructors, 1 associate)
- `location` (VARCHAR(191), 64 populated)
- `socialLinks` (VARCHAR(191), 82 populated)
- `authProvider` (VARCHAR(191), 96 populated: Google, credentials, etc.)
- `oauthId` (VARCHAR(191), 96 populated)
- `oauthImage` (VARCHAR(191), 91 populated)
- `image` & `avatar_url` (LONGTEXT, base64 data URLs)
- `resetToken` & `resetTokenExpires` (20 populated)
- `passwordSetupToken` (5 populated: 4 instructors, 1 mentor)
- `referralCode` (18 populated: 16 students, 2 instructors)
- `blogAccessStatus` (158 populated: default 'ACTIVE')
- `requiresPasswordChange` (7 populated: 6 instructors, 1 mentor)
- `tempPassword` (14 populated: 11 students, 9 instructors/mentors)
- `verificationToken` & `verificationExpires` (19 populated)

---

## 4. Prisma Foreign Key Impact (123 Relations)

There are **123 models** referencing `User` in `prisma/schema.prisma`. Top active relationships:
- `Enrollment` (17 rows)
- `BatchMember` (13 rows)
- `IssuedCertificate` (17 rows)
- `Certificate` (1 row)
- `UserCertification` (18 rows)
- `InternshipApplication` (53 rows)
- `Submission` & `SubmissionVersion` (134 rows)
- `SecurityEvent` (1,004 rows)
- `ActivityLog` (23 references)
- `ConversationParticipant` (854 rows)

> **Conclusion on FK Impact:** `users.id` MUST remain the universal primary key. Any profile extraction MUST use a 1:1 foreign key (`student_profiles.userId` → `users.id`, `teacher_profiles.userId` → `users.id`), ensuring zero impact on the 123 existing Prisma relations.
