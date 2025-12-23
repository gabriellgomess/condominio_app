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
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título da ação (ex: Trocar o piso da piscina)
            $table->string('type')->default('maintenance_general'); // Tipo de ação
            $table->text('description')->nullable(); // Descrição detalhada
            $table->string('responsible')->nullable(); // Responsável pela ação
            $table->date('start_date')->nullable(); // Data de início prevista
            $table->date('end_date')->nullable(); // Data de fim prevista
            $table->date('actual_start_date')->nullable(); // Data de início real
            $table->date('actual_end_date')->nullable(); // Data de fim real
            $table->string('status')->default('pending'); // Status: pending, in_progress, completed, cancelled
            $table->string('priority')->default('medium'); // Prioridade: low, medium, high, urgent
            $table->decimal('estimated_cost', 10, 2)->nullable(); // Custo estimado
            $table->decimal('actual_cost', 10, 2)->nullable(); // Custo real
            $table->text('notes')->nullable(); // Observações
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actions');
    }
};
