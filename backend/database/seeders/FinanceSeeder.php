<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Condominium;
use App\Models\Subaccount;
use App\Models\Revenue;
use App\Models\Expense;

class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $condo = Condominium::first();
        if (!$condo) {
            return;
        }

        $principal = Subaccount::firstOrCreate([
            'condominium_id' => $condo->id,
            'name' => 'Conta Principal',
        ], [
            'category' => 'principal',
        ]);

        $piscina = Subaccount::firstOrCreate([
            'condominium_id' => $condo->id,
            'name' => 'Piscina',
        ], [
            'category' => 'piscina',
        ]);

        Revenue::firstOrCreate([
            'condominium_id' => $condo->id,
            'title' => 'Arrecadação mensal (cota)',
            'competency_date' => now()->startOfMonth()->toDateString(),
        ], [
            'subaccount_id' => $principal->id,
            'source' => 'cota',
            'destination' => 'cota',
            'type' => 'fixa',
            'amount' => 10000.00,
            'is_forecast' => false,
        ]);

        Expense::firstOrCreate([
            'condominium_id' => $condo->id,
            'title' => 'Consumo de água área comum',
            'competency_date' => now()->startOfMonth()->toDateString(),
        ], [
            'subaccount_id' => $principal->id,
            'source' => 'cota',
            'destination' => 'cota',
            'type' => 'variavel',
            'amount' => 2500.00,
            'is_forecast' => false,
        ]);
    }
}






















