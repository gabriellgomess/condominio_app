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
        Schema::create('controls', function (Blueprint $table) {
            $table->id();
            $table->string('control_type'); // Tipo de controle (PPCI, Extintores, etc)
            $table->string('name'); // Nome/descrição do controle
            $table->date('validity_date')->nullable(); // Data de validade
            $table->string('periodicity')->nullable(); // Periodicidade (anual, semestral, quinquenal, etc)
            $table->integer('quantity')->nullable(); // Quantidade (ex: número de extintores)
            $table->text('specifications')->nullable(); // Especificações adicionais (JSON ou texto)
            $table->string('status')->default('active'); // Status: active, expired, approaching
            $table->text('notes')->nullable(); // Observações
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('controls');
    }
};
