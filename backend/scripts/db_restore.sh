#!/bin/bash

set -e

DB_HOST="$DB_HOST"
DB_USER="$DB_USER"
DB_PASSWORD="$DB_PASSWORD"
DB_NAME="$DB_DATABASE"

BACKUP_DIR="/var/www/html/backups"

# =========================
# OBTENER ÚLTIMO BACKUP
# =========================
LATEST_BACKUP=$(ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No se encontraron backups"
    exit 1
fi

echo "Restaurando:"
echo "$LATEST_BACKUP"

# =========================
# LIMPIAR DATABASE
# =========================
mysql \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\`;"

# =========================
# RESTAURAR BACKUP
# =========================
gunzip < "$LATEST_BACKUP" | mysql \
    -h "$DB_HOST" \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    "$DB_NAME"

echo "Restauración de base de datos completado ✅"