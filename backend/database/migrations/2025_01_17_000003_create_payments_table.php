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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_billing_id')->constrained('unit_billings')->onDelete('cascade');
            $table->date('payment_date'); // Data do pagamento
            $table->decimal('amount_paid', 10, 2); // Valor pago
            $table->enum('payment_method', ['bank_slip', 'transfer', 'pix', 'credit_card', 'debit_card', 'cash', 'other'])->default('bank_slip');
            // bank_slip = boleto, transfer = transferência, pix = pix, credit_card = cartão de crédito,
            // debit_card = cartão de débito, cash = dinheiro, other = outro
            $table->string('reference')->nullable(); // Referência/comprovante do pagamento
            $table->string('bank_reference')->nullable(); // Referência bancária (código de autenticação)
            $table->enum('source', ['manual', 'bank_file', 'api'])->default('manual');
            // manual = cadastro manual, bank_file = arquivo de retorno bancário, api = integração API
            $table->text('notes')->nullable(); // Observações
            $table->json('meta')->nullable(); // Informações adicionais
            $table->timestamps();

            // Índices
            $table->index('unit_billing_id');
            $table->index('payment_date');
            $table->index('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
