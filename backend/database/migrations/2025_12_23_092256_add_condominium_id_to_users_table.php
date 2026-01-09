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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('condominium_id')->nullable()->after('access_level')
                ->constrained('condominiums')->onDelete('set null');

            $table->string('access_level_name')->nullable()->after('condominium_id');

            $table->index('condominium_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['condominium_id']);
            $table->dropColumn(['condominium_id', 'access_level_name']);
        });
    }
};
