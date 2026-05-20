FROM php:8.3-apache-bookworm

RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql \
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]