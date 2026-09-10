#!/bin/bash
# Database Backup Script for TechTomorrow
# This script should be added to crontab for daily execution.
# Example: 0 2 * * * /home/mohitraj8503/Documents/Tech\ Tomorrow/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1

set -e

BACKUP_DIR="/home/mohitraj8503/db_backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Extract DB credentials from .env
ENV_FILE="/home/mohitraj8503/Documents/Tech Tomorrow /.env"
if [ -f "$ENV_FILE" ]; then
    DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d "'")
    
    # Simple parse logic for mysql://user:pass@host:port/dbname
    DB_USER=$(echo "$DB_URL" | sed -n 's/.*mysql:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo "$DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

    mkdir -p "$BACKUP_DIR"

    echo "[$(date)] Starting backup of $DB_NAME on $DB_HOST..."
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_FILE"
    echo "[$(date)] Backup completed successfully: $BACKUP_FILE"

    # Retain backups for 7 days
    find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
    echo "[$(date)] Old backups cleaned up."
else
    echo "[$(date)] .env file not found. Cannot perform backup."
    exit 1
fi
