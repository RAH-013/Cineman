#!/bin/bash

set -e

DB_HOST="$DB_HOST"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASSWORD"
DB_NAME="$DB_DATABASE"

BACKUP_DIR="/var/www/html/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
FILE_NAME="backup_${DB_NAME}_${DATE}.sql.gz"
FILE_PATH="${BACKUP_DIR}/${FILE_NAME}"

MAX_BACKUPS=3
MIN_FREE_PERCENT=15

# =========================
# ESPACIO EN DISCO
# =========================
FREE=$(df /var/www/html | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$FREE" -gt $((100 - MIN_FREE_PERCENT)) ]; then
    echo "Espacio insuficiente: ${FREE}% usado"
    exit 1
fi

# =========================
# BACKUP MYSQL + COMPRESIÓN
# =========================
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" --single-transaction --quick --no-tablespaces "$DB_NAME" | gzip > "$FILE_PATH"

# =========================
# ROTACIÓN DE BACKUPS
# =========================
ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm

# =========================
# OUTPUT FINAL
# =========================
echo "$FILE_PATH"