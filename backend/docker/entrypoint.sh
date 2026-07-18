#!/bin/sh
set -e

if [ ! -f .env ]; then
    cp .env.example .env
fi

mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null && [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

echo "Waiting for database at ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
php -r '
$host = getenv("DB_HOST") ?: "mysql";
$port = getenv("DB_PORT") ?: "3306";
$db = getenv("DB_DATABASE") ?: "jewelry";
$user = getenv("DB_USERNAME") ?: "admin";
$pass = getenv("DB_PASSWORD") ?: "";
try {
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $quotedDb = str_replace("`", "``", $db);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$quotedDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database $db is ready.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Could not create database $db: ".$e->getMessage()."\n");
}
'

php -r '
$host = getenv("DB_HOST") ?: "mysql";
$port = getenv("DB_PORT") ?: "3306";
$db = getenv("DB_DATABASE") ?: "jewelry";
$user = getenv("DB_USERNAME") ?: "admin";
$pass = getenv("DB_PASSWORD") ?: "";
$deadline = time() + 60;
while (time() < $deadline) {
    try {
        new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass);
        exit(0);
    } catch (Throwable $e) {
        usleep(1000000);
    }
}
fwrite(STDERR, "Database is not ready after 60 seconds.\n");
exit(1);
'

php artisan migrate --force
php artisan db:seed --class=VietnameseAdministrativeUnitSeeder --force
php artisan db:seed --class=AdminUserSeeder --force

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    php artisan db:seed --force
fi

exec "$@"
