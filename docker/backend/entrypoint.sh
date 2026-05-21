#!/bin/bash

# 1. Asegurar que el directorio de backups exista
mkdir -p /var/www/html/backups

# 2. Asignar la propiedad a www-data (el usuario de Apache por defecto)
# Nota: Ajusta la ruta /var/www/html según cómo tengas configurado tu contenedor
chown -R www-data:www-data /var/www/html/backups
chmod -R 755 /var/www/html/backups

# 3. Dar permisos de ejecución a tu script de base de datos
chmod 755 /var/www/html/db_backup.sh

# 4. Ejecutar el comando principal del contenedor (ej. levantar Apache)
exec "$@"