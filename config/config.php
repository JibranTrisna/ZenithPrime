<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

define('BASE_URL', $_ENV['APP_URL']);

define('DB_HOST', $_ENV['DB_HOST']);
define('DB_NAME', $_ENV['DB_NAME']);
define('DB_USER', $_ENV['DB_USER']);
define('DB_PASS', $_ENV['DB_PASS']);

define('MIDTRANS_SERVER_KEY', $_ENV['MIDTRANS_SERVER_KEY']);
define('MIDTRANS_CLIENT_KEY', $_ENV['MIDTRANS_CLIENT_KEY']);
define('MIDTRANS_IS_PRODUCTION', $_ENV['MIDTRANS_IS_PRODUCTION'] === 'true');