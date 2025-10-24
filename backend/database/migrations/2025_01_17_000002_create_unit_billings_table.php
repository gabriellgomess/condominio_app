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
        Schema::create('unit_billings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monthly_fee_id')->constrained('monthly_fees')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->decimal('ideal_fraction', 10, 6)->default(0); // Fração ideal (ex: 0.012345 = 1.2345%)
            $table->decimal('base_amount', 10, 2); // Valor base calculado pela fração ideal
            $table->decimal('additional_charges', 10, 2)->default(0); // Taxas adicionais (água, gás, etc)
            $table->decimal('discounts', 10, 2)->default(0); // Descontos
            $table->decimal('total_amount', 10, 2); // Valor total do boleto
            $table->string('barcode')->nullable(); // Código de barras do boleto
            $table->string('digitable_line')->nullable(); // Linha digitável do boleto
            $table->string('our_number')->nullable(); // Nosso número (identificação do banco)
            $table->date('due_date'); // Data de vencimento
            $table->enum('status', ['pending', 'paid', 'overdue', 'partially_paid', 'cancelled'])->default('pending');
            // pending = aguardando pagamento, paid = pago, overdue = vencido, partially_paid = pago parcialmente, cancelled = cancelado
            $table->date('payment_date')->nullable(); // Data do pagamento
            $table->decimal('amount_paid', 10, 2)->default(0); // Valor pago
            $table->decimal('late_fee', 10, 2)->default(0); // Multa por atraso
            $table->decimal('interest', 10, 2)->default(0); // Juros por atraso
            $table->text('notes')->nullable(); // Observações
            $table->json('meta')->nullable(); // Informações adicionais (detalhamento de taxas extras, etc)
            $table->timestamps();

            // Índices
            $table->index(['monthly_fee_id', 'unit_id']);
            $table->index('status');
            $table->index('due_date');
            $table->index('payment_date');
            $table->unique(['monthly_fee_id', 'unit_id']); // Uma cobrança por unidade por mês
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_billings');
    }
};
