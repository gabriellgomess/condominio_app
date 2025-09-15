<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Condominium;
use App\Models\Block;
use App\Models\Unit;
use App\Models\ParkingSpace;
use App\Models\Space;

class CondominiumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Criar condomínio de exemplo
        $condominium = Condominium::create([
            'name' => 'Residencial Jardim das Flores',
            'address' => 'Rua das Flores, 123 - Jardim Botânico',
            'city' => 'São Paulo',
            'state' => 'SP',
            'zip_code' => '01234-567',
            'phone' => '(11) 1234-5678',
            'email' => 'admin@jardimflores.com',
            'description' => 'Condomínio residencial com área de lazer completa, piscina, academia e playground.',
            'active' => true,
        ]);

        // Criar blocos/torres
        $torreA = Block::create([
            'condominium_id' => $condominium->id,
            'name' => 'Torre A',
            'description' => 'Torre principal com 20 andares',
            'floors' => 20,
            'units_per_floor' => 4,
            'active' => true,
        ]);

        $torreB = Block::create([
            'condominium_id' => $condominium->id,
            'name' => 'Torre B',
            'description' => 'Torre secundária com 15 andares',
            'floors' => 15,
            'units_per_floor' => 3,
            'active' => true,
        ]);

        $blocoC = Block::create([
            'condominium_id' => $condominium->id,
            'name' => 'Bloco C',
            'description' => 'Bloco de casas térreas',
            'floors' => 1,
            'units_per_floor' => 8,
            'active' => true,
        ]);

        // Criar unidades para Torre A
        for ($floor = 1; $floor <= 20; $floor++) {
            for ($unit = 1; $unit <= 4; $unit++) {
                $unitNumber = $floor . str_pad($unit, 2, '0', STR_PAD_LEFT);

                Unit::create([
                    'condominium_id' => $condominium->id,
                    'block_id' => $torreA->id,
                    'number' => $unitNumber,
                    'type' => 'apartamento',
                    'floor' => $floor,
                    'area' => rand(80, 150),
                    'bedrooms' => rand(2, 4),
                    'bathrooms' => rand(1, 3),
                    'status' => $floor <= 5 ? 'occupied' : 'available',
                    'description' => "Apartamento {$unitNumber} no {$floor}º andar",
                    'active' => true,
                ]);
            }
        }

        // Criar unidades para Torre B
        for ($floor = 1; $floor <= 15; $floor++) {
            for ($unit = 1; $unit <= 3; $unit++) {
                $unitNumber = 'B' . $floor . str_pad($unit, 2, '0', STR_PAD_LEFT);

                Unit::create([
                    'condominium_id' => $condominium->id,
                    'block_id' => $torreB->id,
                    'number' => $unitNumber,
                    'type' => 'apartamento',
                    'floor' => $floor,
                    'area' => rand(90, 180),
                    'bedrooms' => rand(2, 4),
                    'bathrooms' => rand(1, 3),
                    'status' => $floor <= 3 ? 'occupied' : 'available',
                    'description' => "Apartamento {$unitNumber} no {$floor}º andar",
                    'active' => true,
                ]);
            }
        }

        // Criar casas para Bloco C
        for ($house = 1; $house <= 8; $house++) {
            $houseNumber = 'C' . str_pad($house, 2, '0', STR_PAD_LEFT);

            Unit::create([
                'condominium_id' => $condominium->id,
                'block_id' => $blocoC->id,
                'number' => $houseNumber,
                'type' => 'casa',
                'floor' => 1,
                'area' => rand(120, 200),
                'bedrooms' => rand(3, 5),
                'bathrooms' => rand(2, 4),
                'status' => $house <= 3 ? 'occupied' : 'available',
                'description' => "Casa {$houseNumber} térrea",
                'active' => true,
            ]);
        }

        // Criar vagas de garagem
        for ($space = 1; $space <= 100; $space++) {
            $spaceNumber = 'V' . str_pad($space, 3, '0', STR_PAD_LEFT);

            ParkingSpace::create([
                'condominium_id' => $condominium->id,
                'unit_id' => null, // Não vinculada a unidade específica
                'number' => $spaceNumber,
                'type' => $space <= 80 ? 'car' : ($space <= 90 ? 'motorcycle' : 'truck'),
                'location' => $space <= 50 ? 'subsolo' : 'térreo',
                'area' => $space <= 80 ? rand(12, 15) : rand(8, 10),
                'status' => $space <= 60 ? 'occupied' : 'available',
                'description' => "Vaga {$spaceNumber} para " . ($space <= 80 ? 'carro' : ($space <= 90 ? 'moto' : 'caminhão')),
                'covered' => $space <= 50,
                'active' => true,
            ]);
        }

        // Criar depósitos/box
        for ($storage = 1; $storage <= 50; $storage++) {
            $storageNumber = 'D' . str_pad($storage, 3, '0', STR_PAD_LEFT);

            Space::create([
                'condominium_id' => $condominium->id,
                'unit_id' => null, // Não vinculado a unidade específica
                'number' => $storageNumber,
                'space_type' => $storage <= 30 ? 'storage' : ($storage <= 40 ? 'storage_room' : 'other'),
                'location' => $storage <= 25 ? 'subsolo' : 'térreo',
                'area' => rand(5, 12),
                'height' => rand(2, 3),
                'status' => $storage <= 20 ? 'occupied' : 'available',
                'description' => "Espaço {$storageNumber}",
                'climate_controlled' => $storage <= 10,
                'reservable' => $storage <= 5, // Apenas alguns espaços são reserváveis
                'active' => true,
            ]);
        }

        // Vincular algumas vagas e depósitos às unidades
        $units = Unit::where('status', 'occupied')->get();
        $parkingSpaces = ParkingSpace::where('status', 'occupied')->get();
        $spaces = Space::where('status', 'occupied')->get();

        foreach ($units as $index => $unit) {
            if (isset($parkingSpaces[$index])) {
                $parkingSpaces[$index]->update(['unit_id' => $unit->id]);
            }

            if (isset($spaces[$index])) {
                $spaces[$index]->update(['unit_id' => $unit->id]);
            }
        }

        $this->command->info('Sistema de condomínio populado com sucesso!');
        $this->command->info("Condomínio: {$condominium->name}");
        $this->command->info("Blocos: " . Block::count());
        $this->command->info("Unidades: " . Unit::count());
        $this->command->info("Vagas: " . ParkingSpace::count());
        $this->command->info("Espaços: " . Space::count());
    }
}
