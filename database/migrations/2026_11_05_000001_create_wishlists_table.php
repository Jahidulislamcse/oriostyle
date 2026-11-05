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
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'product_id']);
            $table->index(['session_id', 'product_id']);
            $table->unique(['user_id', 'product_id'], 'wishlist_user_product_unique');
            $table->unique(['session_id', 'product_id'], 'wishlist_session_product_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
