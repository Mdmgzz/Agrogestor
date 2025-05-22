#Imagen base con PHP-FPM (ligera, optimizada para PHP)
FROM php:8.2-fpm

# 1. Instalamos dependencias de sistema y drivers de PostgreSQL + ZIP
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \      
    zip \             
&& docker-php-ext-install pdo_pgsql zip

# 2. Instalamos dependencias del sistema y driver de PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git \
  && docker-php-ext-install pdo_pgsql zip

# 3. Copiamos Composer desde su imagen oficial (multi-stage)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4. Directorio de trabajo en el contenedor
WORKDIR /var/www/html

# 5. Copiamos todo el código y instalamos dependencias PHP
COPY . .
RUN composer install --no-interaction --optimize-autoloader

# 6. Ajustamos permisos (Laravel necesita escribir en storage y cache)
RUN chown -R www-data:www-data storage bootstrap/cache

# 7. Exponemos el puerto 9000 (puerto interno de PHP-FPM)
EXPOSE 9000

# 8. Comando por defecto al arrancar el contenedor
CMD ["php-fpm"]
