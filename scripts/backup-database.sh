#!/bin/bash
set -euo pipefail

# TechTomorrow Automated Database Backup
# -------------------------------------

BACKUP_DIR="/backups/techtomorrow/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting database backup..."

# Logical backup with mysqldump
# Ensure DB_HOST, DB_USER, DB_PASS, DB_NAME are set in environment
mysqldump \
  --single-transaction \
  --quick \
  --lock-tables=false \
  -h "$DB_HOST" \
  -u "$DB_USER" \
  --password="$DB_PASS" \
  "$DB_NAME" | gzip > "$BACKUP_DIR/full-backup.sql.gz"

echo "✅ Backup created at $BACKUP_DIR/full-backup.sql.gz"

# Optional: Upload to S3 if AWS CLI is configured
if command -v aws &> /dev/null; then
  echo "☁️ Uploading to S3..."
  aws s3 cp "$BACKUP_DIR/full-backup.sql.gz" \
    "s3://${S3_BACKUP_BUCKET:-techtomorrow-backups}/prod/$(date +%Y%m%d)/" \
    --sse AES256
  echo "✅ Uploaded to S3"
fi

# Verify backup integrity
if ! gzip -t "$BACKUP_DIR/full-backup.sql.gz"; then
  echo "❌ ERROR: Backup verification failed"
  exit 1
fi

# Retention: Keep last 30 daily backups locally
echo "🧹 Cleaning up old backups..."
find /backups/techtomorrow -name "*.sql.gz" -mtime +30 -delete

echo "✨ Backup process complete."
