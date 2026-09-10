-- Run the duplicate audit/backfill before applying this migration.  The unique
-- key is the database-level guard for the canonical course-certificate path.
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_userId_courseId_key` UNIQUE (`userId`, `courseId`);

ALTER TABLE `issued_certificates_v2`
  ADD CONSTRAINT `issued_certificates_v2_userId_certificationId_key` UNIQUE (`userId`, `certificationId`);
