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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone');
            $table->text('shipping_address');
            $table->string('city')->default('Dhaka');
            $table->string('zone')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('payment_method')->default('cod'); // cod, bkash, nagad, bank_transfer
            $table->string('payment_status')->default('unpaid'); // unpaid, paid, partially_paid, refunded
            $table->string('order_status')->default('pending'); // pending, confirmed, processing, shipped, delivered, cancelled, returned
            $table->decimal('subtotal', 12, 2)->default(0.00);
            $table->decimal('shipping_charge', 12, 2)->default(0.00);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->string('currency', 10)->default('BDT');
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index('order_status');
            $table->index('payment_status');
            $table->index('payment_method');
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->json('variant_attributes')->nullable();
            $table->decimal('unit_price', 12, 2)->default(0.00);
            $table->integer('quantity')->default(1);
            $table->decimal('line_total', 12, 2)->default(0.00);
            $table->string('image_path')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
            $table->index('product_variant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
