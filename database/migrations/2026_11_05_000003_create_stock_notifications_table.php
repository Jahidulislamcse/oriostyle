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
        Schema::create('stock_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->boolean('is_notified')->default(false);
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'is_notified']);
            $table->unique(['product_id', 'product_variant_id', 'email'], 'stock_notify_product_variant_email_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_notifications');
    }
};
