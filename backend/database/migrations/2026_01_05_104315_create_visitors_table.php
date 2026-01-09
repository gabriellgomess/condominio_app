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
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('cascade');
            $table->foreignId('resident_id')->nullable()->constrained('residents')->onDelete('set null');

            // Dados do visitante
            $table->string('name');
            $table->enum('document_type', ['rg', 'cpf', 'cnh', 'other'])->default('cpf');
            $table->string('document_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('document_photo_front')->nullable(); // Foto da frente do documento
            $table->string('document_photo_back')->nullable(); // Foto do verso do documento

            // Dados do veículo (opcional)
            $table->string('vehicle_plate')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();

            // Tipo e propósito da visita
            $table->enum('visitor_type', ['personal', 'service', 'delivery', 'taxi', 'other'])->default('personal');
            $table->string('purpose')->nullable(); // Motivo da visita

            // Agendamento
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();

            // Controle de entrada/saída
            $table->dateTime('entry_date')->nullable();
            $table->time('entry_time')->nullable();
            $table->dateTime('exit_date')->nullable();
            $table->time('exit_time')->nullable();

            // Status e controle
            $table->enum('status', ['pending', 'scheduled', 'checked_in', 'checked_out', 'cancelled', 'rejected'])
                  ->default('pending');
            $table->text('notes')->nullable();

            // Autorização e validação
            $table->foreignId('authorized_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('validated_at')->nullable();

            $table->boolean('active')->default(true);
            $table->timestamps();

            // Índices para melhor performance
            $table->index('condominium_id');
            $table->index('unit_id');
            $table->index('status');
            $table->index('scheduled_date');
            $table->index(['condominium_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
