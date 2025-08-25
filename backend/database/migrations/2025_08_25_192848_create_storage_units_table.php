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
        Schema::create('storage_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->string('number');                  // Número do depósito/box (ex: D01, B001)
            $table->string('type')->default('storage'); // Tipo: storage, box, cellar, attic
            $table->string('location')->nullable();    // Localização (ex: subsolo, térreo)
            $table->decimal('area', 8, 2)->nullable(); // Área em m²
            $table->decimal('height', 5, 2)->nullable(); // Altura em metros
            $table->string('status')->default('available'); // Status: available, occupied, reserved, maintenance
            $table->text('description')->nullable();   // Descrição adicional
            $table->boolean('climate_controlled')->default(false); // Controle de temperatura
            $table->boolean('active')->default(true);  // Status ativo/inativo
            $table->timestamps();
            
            // Índices
            $table->index('condominium_id');
            $table->index('unit_id');
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
        Schema::dropIfExists('storage_units');
    }
};
