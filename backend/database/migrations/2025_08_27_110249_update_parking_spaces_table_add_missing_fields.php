<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('parking_spaces', function (Blueprint $table) {
            // Adicionar campo size para tamanho da vaga
            $table->string('size')->nullable()->after('type');

            // Modificar o campo type para aceitar os valores do frontend
            $table->string('type')->default('covered')->change();

            // Garantir que o campo active tenha valor padrão
            $table->boolean('active')->default(true)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parking_spaces', function (Blueprint $table) {
            // Remover campo size
            $table->dropColumn('size');

            // Reverter o campo type para o valor original
            $table->string('type')->default('car')->change();

            // Reverter o campo active para o valor original
            $table->boolean('active')->default(true)->change();
        });
    }
};
