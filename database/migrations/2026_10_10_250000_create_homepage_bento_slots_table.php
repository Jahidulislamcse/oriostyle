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
        Schema::create('homepage_bento_slots', function (Blueprint $table) {
            $table->id();
            $table->string('slot_key', 50)->unique(); // slot_1_tall, slot_2_half, etc.
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('image_path')->nullable();
            $table->string('aspect_ratio', 20)->default('tall'); // tall, half, wide
            $table->string('recommended_dimensions', 50)->default('600 × 780px');
            $table->boolean('has_arrow')->default(false);
            $table->boolean('dark_badge')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->integer('display_order')->default(0)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_bento_slots');
    }
};
