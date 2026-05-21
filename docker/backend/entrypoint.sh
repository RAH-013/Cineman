#!/bin/bash

mkdir -p /var/www/html/backups
chown -R www-data:www-data /var/www/html/backups
chmod -R 755 /var/www/html/backups

if [ -f "/var/www/html/db_backup.sh" ]; then
    chmod 755 /var/www/html/db_backup.sh
fi

if [ -f "/var/www/html/composer.json" ]; then
    echo "📦 Detectado composer.json. Instalando dependencias..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
    
    chown -R www-data:www-data /var/www/html/vendor
fi

exec "$@"