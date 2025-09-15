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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');

            // Dados da empresa
            $table->string('company_name');
            $table->string('trade_name')->nullable();
            $table->string('cnpj', 18)->nullable()->unique();
            $table->string('cpf', 14)->nullable()->unique();
            $table->enum('supplier_type', ['company', 'mei', 'individual'])->default('company');
            $table->enum('category', [
                'maintenance',
                'cleaning',
                'security',
                'gardening',
                'plumbing',
                'electrical',
                'painting',
                'pest_control',
                'elevator',
                'pool',
                'technology',
                'other'
            ])->default('other');

            // Dados de contato
            $table->string('contact_name');
            $table->string('email')->unique();
            $table->string('phone', 20);
            $table->string('mobile', 20)->nullable();

            // Endereço
            $table->string('address');
            $table->string('number', 20)->nullable();
            $table->string('cep', 10);
            $table->string('city');
            $table->string('state', 2);
            $table->string('district')->nullable();

            // Serviços e valores
            $table->text('services_description')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('monthly_rate', 10, 2)->nullable();

            // Contrato
            $table->date('contract_start')->nullable();
            $table->date('contract_end')->nullable();

            // Status e avaliação
            $table->enum('status', ['active', 'inactive', 'pending', 'blocked'])->default('active');
            $table->decimal('evaluation', 2, 1)->nullable()->comment('Avaliação de 1 a 5');

            // Observações e dados extras
            $table->text('notes')->nullable();
            $table->json('documents')->nullable()->comment('Documentos anexados');
            $table->string('emergency_contact')->nullable();
            $table->json('availability')->nullable()->comment('Horários de disponibilidade');

            // Controle geral
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Índices
            $table->index(['condominium_id', 'category']);
            $table->index(['condominium_id', 'status']);
            $table->index(['category', 'status']);
            $table->index('evaluation');
            $table->index('contract_end');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};




