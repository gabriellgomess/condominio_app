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
        Schema::create('blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->string('name');                    // Nome do bloco/torre (ex: Torre A, Bloco 1)
            $table->string('description')->nullable(); // Descrição adicional
            $table->integer('floors')->nullable();     // Número de andares
            $table->integer('units_per_floor')->nullable(); // Unidades por andar
            $table->boolean('active')->default(true);  // Status ativo/inativo
            $table->timestamps();
            
            // Índices
            $table->index('condominium_id');
            $table->index('active');
            $table->index(['condominium_id', 'name']); // Nome único por condomínio
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blocks');
    }
};
