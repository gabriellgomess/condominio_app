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
        Schema::table('residents', function (Blueprint $table) {
            // Adicionar coluna user_id para vincular o morador ao usuário (proprietário)
            $table->foreignId('owner_user_id')->nullable()->after('owner_cpf')
                ->constrained('users')->onDelete('set null');

            // Adicionar coluna user_id para vincular o inquilino ao usuário (se houver)
            $table->foreignId('tenant_user_id')->nullable()->after('tenant_cpf')
                ->constrained('users')->onDelete('set null');

            // Adicionar índices
            $table->index('owner_user_id');
            $table->index('tenant_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residents', function (Blueprint $table) {
            $table->dropForeign(['owner_user_id']);
            $table->dropForeign(['tenant_user_id']);
            $table->dropColumn(['owner_user_id', 'tenant_user_id']);
        });
    }
};
