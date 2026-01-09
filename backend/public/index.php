<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Desabilitar warnings de deprecated e strict para evitar poluir respostas JSON
// Usando valor numérico direto para evitar constantes deprecated
error_reporting(E_ALL & ~E_DEPRECATED & ~2048); // 2048 é o valor de E_STRICT

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
