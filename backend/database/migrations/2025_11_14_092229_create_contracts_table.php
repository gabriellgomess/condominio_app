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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->string('contract_type'); // Tipo de contrato (gás, portões, interfones, etc.)
            $table->string('company_name'); // Nome da empresa/prestador
            $table->text('description')->nullable(); // Descrição do contrato
            $table->date('start_date'); // Data de início
            $table->date('end_date'); // Data de vencimento
            $table->string('adjustment_index')->nullable(); // Índice de reajuste (IGPM, IPCA, etc.)
            $table->date('termination_notice_date')->nullable(); // Data de notificação de rescisão
            $table->decimal('contract_value', 10, 2)->nullable(); // Valor do contrato
            $table->string('status')->default('active'); // Status: active, expired, terminated
            $table->text('notes')->nullable(); // Observações adicionais
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
