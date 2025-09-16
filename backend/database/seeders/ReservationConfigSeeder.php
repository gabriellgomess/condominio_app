<?php

use Illuminate\Database\Seeder;
use App\Models\ReservationConfig;
use App\Models\Space;
use App\Models\Condominium;

class ReservationConfigSeeder extends Seeder
{
    public function run()
    {
        // Buscar um condomínio e espaço existentes
        $condominium = Condominium::first();
        if (!$condominium) {
            echo "Nenhum condomínio encontrado. Execute o CondominiumSeeder primeiro.\n";
            return;
        }

        $space = Space::where('condominium_id', $condominium->id)
            ->where('reservable', true)
            ->first();

        if (!$space) {
            echo "Nenhum espaço reservável encontrado. Configure um espaço como reservável primeiro.\n";
            return;
        }

        // Criar configuração de teste
        $config = ReservationConfig::create([
            'space_id' => $space->id,
            'condominium_id' => $condominium->id,
            'available_days' => ['wednesday', 'thursday', 'friday', 'saturday', 'sunday'], // Sem segunda e terça
            'start_time' => '08:00',
            'end_time' => '22:00',
            'duration_minutes' => 60,
            'min_advance_hours' => 24,
            'max_advance_days' => 30,
            'max_reservations_per_day' => 5,
            'max_reservations_per_user_per_month' => 2,
            'hourly_rate' => 50.00,
            'daily_rate' => 200.00,
            'active' => true,
            'description' => 'Configuração de teste - Sem segunda e terça'
        ]);

        echo "Configuração criada:\n";
        echo "ID: " . $config->id . "\n";
        echo "Espaço: " . $space->number . "\n";
        echo "Dias disponíveis: " . json_encode($config->available_days) . "\n";
        echo "Ativo: " . ($config->active ? 'Sim' : 'Não') . "\n";
    }
}

