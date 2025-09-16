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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->onDelete('cascade');
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');

            // Dados da reserva
            $table->date('reservation_date'); // Data da reserva
            $table->time('start_time'); // Horário de início
            $table->time('end_time'); // Horário de fim
            $table->integer('duration_minutes'); // Duração em minutos

            // Informações do solicitante
            $table->string('contact_name'); // Nome do responsável
            $table->string('contact_phone'); // Telefone de contato
            $table->string('contact_email')->nullable(); // Email de contato

            // Detalhes do evento
            $table->string('event_type')->nullable(); // Tipo de evento (festa, reunião, etc.)
            $table->text('event_description')->nullable(); // Descrição do evento
            $table->integer('expected_guests')->nullable(); // Número esperado de convidados

            // Status da reserva
            $table->enum('status', [
                'pending',
                'confirmed',
                'cancelled',
                'completed',
                'rejected'
            ])->default('pending');

            // Valores financeiros
            $table->decimal('total_amount', 10, 2)->nullable(); // Valor total
            $table->decimal('paid_amount', 10, 2)->default(0); // Valor pago
            $table->enum('payment_status', [
                'pending',
                'paid',
                'partial',
                'refunded'
            ])->default('pending');

            // Observações
            $table->text('user_notes')->nullable(); // Observações do usuário
            $table->text('admin_notes')->nullable(); // Observações da administração

            // Controle
            $table->timestamp('confirmed_at')->nullable(); // Data de confirmação
            $table->timestamp('cancelled_at')->nullable(); // Data de cancelamento
            $table->string('cancellation_reason')->nullable(); // Motivo do cancelamento

            $table->boolean('active')->default(true);
            $table->timestamps();

            // Índices para performance
            $table->index(['space_id', 'reservation_date', 'status']);
            $table->index(['condominium_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['reservation_date', 'start_time', 'end_time']);

            // Constraint para evitar sobreposição
            $table->unique(['space_id', 'reservation_date', 'start_time'], 'unique_space_datetime_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
