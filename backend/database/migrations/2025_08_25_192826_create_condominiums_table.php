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
        Schema::create('condominiums', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Nome do condomínio
            $table->string('address');                 // Endereço completo
            $table->string('city');                    // Cidade
            $table->string('state');                   // Estado
            $table->string('zip_code');                // CEP
            $table->string('phone')->nullable();       // Telefone
            $table->string('email')->nullable();       // Email
            $table->text('description')->nullable();   // Descrição
            $table->boolean('active')->default(true);  // Status ativo/inativo
            $table->timestamps();
            
            // Índices
            $table->index('active');
            $table->index('city');
            $table->index('state');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('condominiums');
    }
};
