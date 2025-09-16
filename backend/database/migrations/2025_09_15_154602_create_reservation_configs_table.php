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
        Schema::create('reservation_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->onDelete('cascade');
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');

            // Configurações de disponibilidade
            $table->json('available_days'); // ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            $table->time('start_time'); // Horário de início (ex: 08:00)
            $table->time('end_time'); // Horário de fim (ex: 22:00)
            $table->integer('duration_minutes')->default(60); // Duração mínima de reserva em minutos

            // Configurações de antecedência
            $table->integer('min_advance_hours')->default(24); // Mínimo de horas de antecedência
            $table->integer('max_advance_days')->default(30); // Máximo de dias de antecedência

            // Configurações de limite
            $table->integer('max_reservations_per_day')->nullable(); // Máximo de reservas por dia
            $table->integer('max_reservations_per_user_per_month')->nullable(); // Máximo de reservas por usuário por mês

            // Configurações de preço (opcional)
            $table->decimal('hourly_rate', 8, 2)->nullable(); // Taxa por hora
            $table->decimal('daily_rate', 8, 2)->nullable(); // Taxa por dia

            // Status
            $table->boolean('active')->default(true);
            $table->text('description')->nullable(); // Descrição das regras de reserva

            $table->timestamps();

            // Índices
            $table->index(['space_id', 'active']);
            $table->index(['condominium_id', 'active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_configs');
    }
};
