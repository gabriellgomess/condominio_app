<?php

/**
 * Script de teste para o endpoint getReservableSpaces
 * Execute com: php test-reservable-spaces.php
 */

require __DIR__ . '/backend/vendor/autoload.php';

$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "═══════════════════════════════════════════════════════════════\n";
echo "  TESTE DO ENDPOINT: GET /api/condominiums/1/reservable-spaces\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

try {
    $controller = new \App\Http\Controllers\Reservation\ReservationConfigController();
    $response = $controller->getReservableSpaces(1);
    $data = $response->getData(true); // true = retorna como array

    echo "✅ STATUS: " . $data['status'] . "\n";
    echo "📝 MENSAGEM: " . $data['message'] . "\n";
    echo "📊 QUANTIDADE DE ESPAÇOS: " . count($data['data']) . "\n\n";

    if (count($data['data']) > 0) {
        echo "═══════════════════════════════════════════════════════════════\n";
        echo "  ESPAÇOS RETORNADOS:\n";
        echo "═══════════════════════════════════════════════════════════════\n\n";

        foreach ($data['data'] as $index => $space) {
            echo "Espaço #" . ($index + 1) . ":\n";
            echo "  ID Config: " . $space['id'] . "\n";
            echo "  Space ID: " . $space['space_id'] . "\n";
            echo "  Nome: " . $space['name'] . "\n";
            echo "  Número: " . $space['number'] . "\n";
            echo "  Localização: " . ($space['location'] ?? 'N/A') . "\n";
            echo "  Horário: " . $space['start_time'] . " - " . $space['end_time'] . "\n";
            echo "  Dias disponíveis: " . implode(', ', $space['available_days']) . "\n";
            echo "\n";
        }
    } else {
        echo "⚠️  ARRAY DE DADOS ESTÁ VAZIO!\n\n";
        echo "Verificando no banco de dados...\n\n";

        $configs = \App\Models\ReservationConfig::where('condominium_id', 1)
            ->where('active', true)
            ->with(['space'])
            ->get();

        echo "Configs ativos no banco: " . $configs->count() . "\n";
        foreach ($configs as $config) {
            echo "  - Config ID {$config->id}: Space ID {$config->space_id} ({$config->space->number}) - Space Reservable: " . ($config->space->reservable ? 'SIM' : 'NÃO') . "\n";
        }
    }

    echo "\n═══════════════════════════════════════════════════════════════\n";
    echo "  RESPOSTA JSON COMPLETA:\n";
    echo "═══════════════════════════════════════════════════════════════\n\n";
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

} catch (\Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    echo "\nStack Trace:\n" . $e->getTraceAsString() . "\n";
}
