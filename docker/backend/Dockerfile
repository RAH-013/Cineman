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

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]

CMD ["apache2-foreground"]