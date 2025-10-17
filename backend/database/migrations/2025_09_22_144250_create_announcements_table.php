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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('condominium_id');
            $table->unsignedBigInteger('user_id'); // Autor do comunicado
            $table->string('title');
            $table->text('content');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->enum('target_type', ['all', 'block', 'unit', 'specific'])->default('all');
            $table->json('target_ids')->nullable(); // IDs específicos quando target_type = 'specific'
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('send_email')->default(false);
            $table->boolean('send_notification')->default(true);
            $table->json('attachments')->nullable(); // Array de arquivos anexos
            $table->text('notes')->nullable(); // Notas internas do admin
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Índices
            $table->index(['condominium_id', 'status']);
            $table->index(['published_at']);
            $table->index(['expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
