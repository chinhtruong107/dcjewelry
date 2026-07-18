FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts --optimize-autoloader

COPY . .
RUN composer dump-autoload --optimize

FROM php:8.2-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=vendor /app .
COPY docker/entrypoint.sh /usr/local/bin/backend-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/backend-entrypoint \
    && chmod +x /usr/local/bin/backend-entrypoint

EXPOSE 8002

ENTRYPOINT ["backend-entrypoint"]
CMD ["sh", "-c", "cd public && exec php -S 0.0.0.0:8002 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"]
