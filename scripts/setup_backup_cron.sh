#!/usr/bin/env bash
set -euo pipefail

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup_db.sh"
LOG_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/backups"

mkdir -p "$LOG_DIR"

CRON_ENTRY="0 */4 * * * $BACKUP_SCRIPT >> $LOG_DIR/backup.log 2>&1"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -qF "$BACKUP_SCRIPT"; then
    echo "Backup cron already active. Current entry:"
    crontab -l | grep "$BACKUP_SCRIPT"
    exit 0
fi

# Append to existing crontab
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo "Cron job installed. Database will be backed up every 4 hours."
echo "Entry: $CRON_ENTRY"
echo ""
echo "To verify:  crontab -l"
echo "To remove:  crontab -l | grep -v backup_db.sh | crontab -"
