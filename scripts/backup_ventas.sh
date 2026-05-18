#!/bin/bash

if [ -f "/home/fernando/Cineman/ .env" ]; then
	export $(cat /home/fernando/Cineman/.env | grep -v '^#' | xargs)
fi
CONTAINER_MYSQL="cineman_mysql"
DB_NAME="$DB_DATABASE"
BACKUP_DIR="/home/fernando/Cineman/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_ventas_$DATE.sql"

mkdir -p "$BACKUP_DIR"

DISK_AVAILABLE_PCT=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
SPACE_FREE=$((100 - DISK_AVAILABLE_PCT))

echo "Espacio disponible actual: $SPACE_FREE%"

if [ "$SPACE_FREE" -gt 15 ]; then
    echo "[$(date)] Espacio suficiente verificado. Iniciando respaldo..."
    
	docker exec "$CONTAINER_MYSQL" sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Respaldo crítico creado con éxito: $BACKUP_FILE"
    else
        echo "[$(date)] ERROR: Falló la exportación de la base de datos."
    fi
else
    echo "[$(date)] CRÍTICO: Almacenamiento disponible menor al 15%. Respaldo abortado por seguridad." | tee -a /var/log/cine_error.log
fi
