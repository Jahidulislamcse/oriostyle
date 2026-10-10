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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone');
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('Bangladesh');
            $table->decimal('opening_balance', 12, 2)->default(0.00);
            $table->decimal('current_balance', 12, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('is_active');
            $table->index('name');
            $table->index('phone');
            $table->index('current_balance');
        });

        Schema::create('supplier_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->string('transaction_type'); // opening_balance, purchase, payment, return, adjustment
            $table->string('reference_no')->nullable();
            $table->decimal('debit', 12, 2)->default(0.00);  // Payment made (reduces payable balance)
            $table->decimal('credit', 12, 2)->default(0.00); // Purchase / bill (increases payable balance)
            $table->decimal('balance', 12, 2);               // Running balance after transaction
            $table->string('payment_method')->nullable();    // cash, bank_transfer, cheque, bkash, nagad
            $table->date('transaction_date');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['supplier_id', 'transaction_date']);
            $table->index('transaction_type');
            $table->index('reference_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_ledgers');
        Schema::dropIfExists('suppliers');
    }
};
