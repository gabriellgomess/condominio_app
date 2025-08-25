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
        Schema::create('parking_spaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->string('number');                  // Número da vaga (ex: V01, P001)
            $table->string('type')->default('car');    // Tipo: car, motorcycle, truck, bicycle
            $table->string('location')->nullable();    // Localização (ex: subsolo, térreo)
            $table->decimal('area', 8, 2)->nullable(); // Área em m²
            $table->string('status')->default('available'); // Status: available, occupied, reserved, maintenance
            $table->text('description')->nullable();   // Descrição adicional
            $table->boolean('covered')->default(false); // Coberta ou descoberta
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
        Schema::dropIfExists('parking_spaces');
    }
};
