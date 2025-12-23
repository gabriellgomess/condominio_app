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
        Schema::create('supplier_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->string('title'); // Título da publicação
            $table->text('description'); // Descrição do produto/serviço
            $table->string('image_path')->nullable(); // Caminho da imagem
            $table->decimal('price', 10, 2)->nullable(); // Preço (opcional)
            $table->string('contact_info')->nullable(); // Informação de contato
            $table->boolean('is_active')->default(true); // Publicação ativa
            $table->date('expires_at')->nullable(); // Data de expiração da publicação
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_posts');
    }
};
