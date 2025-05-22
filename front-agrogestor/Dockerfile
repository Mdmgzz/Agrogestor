# back-agrogestor/Dockerfile
FROM php:8.2-cli

# Instala dependencias, Composer, etc. (igual que antes)…
RUN apt-get update && apt-get install -y libpq-dev zip unzip git \
  && docker-php-ext-install pdo_pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-interaction --optimize-autoloader

COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000

# El CMD que lanza Laravel, reemplaza el entrypoint por defecto
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
