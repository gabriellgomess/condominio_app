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
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condominium_id')->constrained('condominiums')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('resident_id')->nullable()->constrained()->onDelete('set null');

            $table->string('title');
            $table->text('description');
            $table->enum('type', ['manutencao', 'seguranca', 'ruido', 'limpeza', 'vizinhanca', 'outros']);
            $table->enum('priority', ['baixa', 'media', 'alta', 'urgente']);
            $table->enum('status', ['aberta', 'em_andamento', 'resolvida', 'fechada'])->default('aberta');
            $table->string('location');
            $table->datetime('incident_date');
            $table->json('photos')->nullable();
            $table->text('resolution')->nullable();
            $table->datetime('resolved_at')->nullable();
            $table->enum('reported_by', ['administracao', 'morador', 'portaria', 'funcionario'])->default('administracao');
            $table->boolean('is_anonymous')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['condominium_id', 'status']);
            $table->index(['condominium_id', 'type']);
            $table->index(['condominium_id', 'priority']);
            $table->index(['incident_date']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
