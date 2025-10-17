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
        Schema::table('incidents', function (Blueprint $table) {
            $table->foreignId('block_id')->nullable()->after('condominium_id')->constrained()->onDelete('set null');
            $table->index(['condominium_id', 'block_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->dropIndex(['condominium_id', 'block_id']);
            $table->dropForeign(['block_id']);
            $table->dropColumn('block_id');
        });
    }
};
