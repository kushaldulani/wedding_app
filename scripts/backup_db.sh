#!/usr/bin/env bash
set -euo pipefail

# Resolve project root (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="wedding_db_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# Run pg_dump inside the DB container and compress
docker compose -f "$PROJECT_DIR/docker-compose.yml" exec -T db \
    pg_dump -U postgres wedding_db | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup is not empty
if [ ! -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "[$(date)] ERROR: Backup file is empty!"
    rm -f "$BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup saved: $BACKUP_FILE ($SIZE)"

# Delete backups older than retention period
DELETED=$(find "$BACKUP_DIR" -name "wedding_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
    echo "[$(date)] Cleaned up $DELETED backup(s) older than $RETENTION_DAYS days"
fi

echo "[$(date)] Done."
