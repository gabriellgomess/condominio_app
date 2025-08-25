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
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('block_id')->nullable()->constrained('blocks')->onDelete('cascade');
            $table->string('number');                  // Número da unidade (ex: 101, Apto 1)
            $table->string('type');                    // Tipo: apartamento, casa, sala, loja
            $table->integer('floor')->nullable();      // Andar
            $table->decimal('area', 8, 2)->nullable(); // Área em m²
            $table->integer('bedrooms')->nullable();   // Número de quartos
            $table->integer('bathrooms')->nullable();  // Número de banheiros
            $table->string('status')->default('available'); // Status: available, occupied, maintenance
            $table->text('description')->nullable();   // Descrição adicional
            $table->boolean('active')->default(true);  // Status ativo/inativo
            $table->timestamps();
            
            // Índices
            $table->index('condominium_id');
            $table->index('block_id');
            $table->index('number');
            $table->index('type');
            $table->index('status');
            $table->index('active');
            $table->unique(['condominium_id', 'number']); // Número único por condomínio
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
