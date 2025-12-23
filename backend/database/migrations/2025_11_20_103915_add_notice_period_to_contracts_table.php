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
        Schema::table('contracts', function (Blueprint $table) {
            // Prazo de aviso prévio em dias (30, 60, 90)
            $table->integer('notice_period_days')->default(30)->after('termination_notice_date');
            // Se o contrato renova automaticamente
            $table->boolean('auto_renew')->default(true)->after('notice_period_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['notice_period_days', 'auto_renew']);
        });
    }
};
