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
        Schema::create('product_bundles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('main_product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('paired_product_id')->constrained('products')->cascadeOnDelete();
            $table->decimal('discount_percentage', 5, 2)->default(5.00);
            $table->string('badge_label')->nullable()->default('Style Pairing');
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->unique(['main_product_id', 'paired_product_id'], 'bundle_main_paired_unique');
            $table->index(['main_product_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_bundles');
    }
};
