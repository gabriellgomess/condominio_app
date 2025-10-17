<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->cascadeOnDelete();
            $table->foreignId('subaccount_id')->nullable()->constrained('subaccounts')->nullOnDelete();
            $table->enum('source', ['cota', 'po']);
            $table->enum('destination', ['cota', 'po']);
            $table->enum('type', ['fixa', 'variavel']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('competency_date');
            $table->decimal('amount', 14, 2);
            $table->boolean('is_forecast')->default(false); // previsão vs realizado
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['condominium_id', 'competency_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
