<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuário Administrador
        User::create([
            'name' => 'Administrador Sistema',
            'email' => 'admin@condominio.com',
            'password' => Hash::make('123456'),
            'access_level' => User::ACCESS_LEVEL_ADMINISTRADOR,
        ]);

        // Usuário Síndico
        User::create([
            'name' => 'João Silva - Síndico',
            'email' => 'sindico@condominio.com',
            'password' => Hash::make('123456'),
            'access_level' => User::ACCESS_LEVEL_SINDICO,
        ]);

        // Usuário Morador
        User::create([
            'name' => 'Maria Santos - Moradora',
            'email' => 'morador@condominio.com',
            'password' => Hash::make('123456'),
            'access_level' => User::ACCESS_LEVEL_MORADOR,
        ]);

        // Usuário Funcionário
        User::create([
            'name' => 'Pedro Costa - Porteiro',
            'email' => 'funcionario@condominio.com',
            'password' => Hash::make('123456'),
            'access_level' => User::ACCESS_LEVEL_FUNCIONARIO,
        ]);

        $this->command->info('Usuários de exemplo criados com sucesso!');
        $this->command->info('Email: admin@condominio.com | Senha: 123456 | Nível: Administrador');
        $this->command->info('Email: sindico@condominio.com | Senha: 123456 | Nível: Síndico');
        $this->command->info('Email: morador@condominio.com | Senha: 123456 | Nível: Morador');
        $this->command->info('Email: funcionario@condominio.com | Senha: 123456 | Nível: Funcionário');
    }
}
