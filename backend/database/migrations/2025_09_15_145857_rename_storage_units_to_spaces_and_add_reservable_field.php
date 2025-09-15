<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Renomear tabela de storage_units para spaces
        Schema::rename('storage_units', 'spaces');

        // Adicionar campo reservable
        Schema::table('spaces', function (Blueprint $table) {
            $table->boolean('reservable')->default(false)->after('climate_controlled');
            $table->string('space_type')->default('storage')->after('type'); // Novo campo para tipos específicos
        });

        // Atualizar tipos existentes para usar o novo campo space_type
        DB::table('spaces')->update(['space_type' => DB::raw('type')]);

        // Remover o campo type antigo
        Schema::table('spaces', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Adicionar campo type de volta
        Schema::table('spaces', function (Blueprint $table) {
            $table->string('type')->default('storage')->after('space_type');
        });

        // Copiar dados de space_type para type
        DB::table('spaces')->update(['type' => DB::raw('space_type')]);

        // Remover campos adicionados
        Schema::table('spaces', function (Blueprint $table) {
            $table->dropColumn(['reservable', 'space_type']);
        });

        // Renomear tabela de volta para storage_units
        Schema::rename('spaces', 'storage_units');
    }
};
