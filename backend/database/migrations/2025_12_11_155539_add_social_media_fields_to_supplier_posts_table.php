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
        Schema::table('supplier_posts', function (Blueprint $table) {
            $table->string('instagram')->nullable()->after('contact_info');
            $table->string('facebook')->nullable()->after('instagram');
            $table->string('whatsapp')->nullable()->after('facebook');
            $table->string('website')->nullable()->after('whatsapp');
            $table->string('catalog_url')->nullable()->after('website'); // Link para folder/catálogo
            $table->text('services_offered')->nullable()->after('description'); // Serviços oferecidos
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supplier_posts', function (Blueprint $table) {
            $table->dropColumn([
                'instagram',
                'facebook',
                'whatsapp',
                'website',
                'catalog_url',
                'services_offered'
            ]);
        });
    }
};
