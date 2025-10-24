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
        Schema::create('monthly_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->date('reference_month'); // Primeiro dia do mês de referência (ex: 2025-01-01)
            $table->decimal('base_value', 10, 2); // Valor base da cota condominial
            $table->date('due_date'); // Data de vencimento padrão
            $table->date('issue_date')->nullable(); // Data de emissão dos boletos
            $table->enum('status', ['draft', 'issued', 'closed', 'cancelled'])->default('draft');
            // draft = rascunho, issued = boletos emitidos, closed = período fechado, cancelled = cancelado
            $table->text('notes')->nullable(); // Observações
            $table->json('meta')->nullable(); // Informações adicionais (juros, multa, desconto, etc)
            $table->timestamps();

            // Índices
            $table->index(['condominium_id', 'reference_month']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_fees');
    }
};
