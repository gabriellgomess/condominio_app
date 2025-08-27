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
        Schema::create('residents', function (Blueprint $table) {
            $table->id();

            // Relacionamentos
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');

            // Status da unidade
            $table->enum('unit_status', ['occupied', 'vacant', 'maintenance'])->default('occupied');

            // Dados do proprietário (obrigatório)
            $table->string('owner_name');
            $table->string('owner_email');
            $table->string('owner_phone');
            $table->string('owner_cpf');
            $table->enum('owner_status', ['active', 'inactive', 'pending'])->default('active');
            $table->text('owner_notes')->nullable();

            // Dados do inquilino (opcional)
            $table->boolean('has_tenant')->default(false);
            $table->string('tenant_name')->nullable();
            $table->string('tenant_email')->nullable();
            $table->string('tenant_phone')->nullable();
            $table->string('tenant_cpf')->nullable();
            $table->enum('tenant_status', ['active', 'inactive', 'pending'])->default('inactive');
            $table->date('tenant_lease_start')->nullable();
            $table->date('tenant_lease_end')->nullable();
            $table->text('tenant_notes')->nullable();

            // Informações gerais
            $table->integer('total_residents')->default(1);
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);

            $table->timestamps();

            // Índices
            $table->index(['condominium_id', 'unit_id']);
            $table->index('owner_email');
            $table->index('owner_cpf');
            $table->index('tenant_email');
            $table->index('tenant_cpf');
            $table->index('has_tenant');

            // Constraints únicos
            $table->unique(['unit_id'], 'unique_unit_resident');
            $table->unique(['owner_cpf'], 'unique_owner_cpf');
            $table->unique(['tenant_cpf'], 'unique_tenant_cpf_when_not_null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
