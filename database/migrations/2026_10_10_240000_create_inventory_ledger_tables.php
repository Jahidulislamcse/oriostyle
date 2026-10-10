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
        // 1. Inventory Movements Ledger (Immutable audit log of all stock changes)
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            
            // Movement classification: purchase_in, order_out, adjustment_increase, adjustment_decrease, damage_loss, return_in, cycle_count
            $table->string('type', 40);
            
            // Quantity delta (positive for stock increase, negative for stock reduction)
            $table->integer('quantity');
            $table->integer('quantity_before')->default(0);
            $table->integer('quantity_after')->default(0);
            
            // Financial tracking at time of movement
            $table->decimal('unit_cost', 12, 2)->default(0.00);
            $table->decimal('total_cost', 12, 2)->default(0.00);
            
            // Reason and Reference tracking
            $table->string('reason', 100);
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            
            // Auditing
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Indexes for fast ledger lookups & chronological reporting
            $table->index(['product_id', 'created_at']);
            $table->index(['product_variant_id', 'created_at']);
            $table->index('type');
            $table->index(['reference_type', 'reference_id']);
        });

        // 2. Damage & Write-off Logs (Tracking unsellable or lost stock with financial valuation)
        Schema::create('damage_logs', function (Blueprint $table) {
            $table->id();
            $table->string('damage_number', 50)->unique();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2)->default(0.00);
            $table->decimal('total_loss_amount', 12, 2)->default(0.00);
            
            // Reason: broken, transit_damage, stained, defective, expired, water_leakage, theft, sample
            $table->string('reason', 50);
            $table->string('status', 30)->default('written_off'); // written_off, disposed, pending_review
            $table->text('notes')->nullable();
            
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
            $table->index('reason');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('damage_logs');
        Schema::dropIfExists('inventory_movements');
    }
};
