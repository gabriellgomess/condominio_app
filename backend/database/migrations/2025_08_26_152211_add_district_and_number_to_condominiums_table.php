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
        Schema::table('condominiums', function (Blueprint $table) {
            $table->string('district')->nullable()->after('city'); // Bairro
            $table->string('number')->nullable()->after('address'); // Número
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('condominiums', function (Blueprint $table) {
            $table->dropColumn(['district', 'number']);
        });
    }
};
