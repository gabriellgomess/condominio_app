<?php

require 'vendor/autoload.php';
require 'bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testando configurações de reserva:\n";

$configs = App\Models\ReservationConfig::with('space')->get();

foreach ($configs as $config) {
    echo "ID: " . $config->id . ", Space: " . $config->space->number . ", Available Days: " . json_encode($config->available_days) . "\n";
}

echo "\nTestando API endpoint:\n";

$response = app('App\Http\Controllers\Reservation\ReservationConfigController')->index(
    new Illuminate\Http\Request(),
    1 // condominium_id
);

echo "Response: " . $response->getContent() . "\n";

