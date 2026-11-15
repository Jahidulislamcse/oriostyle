<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create dedicated admins table
        if (!Schema::hasTable('admins')) {
            Schema::create('admins', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('phone')->nullable();
                $table->string('role', 50)->default('admin');
                $table->string('avatar')->nullable();
                $table->string('password');
                $table->boolean('is_active')->default(true);
                $table->rememberToken();
                $table->timestamps();

                $table->index('email');
                $table->index('role');
                $table->index('is_active');
            });
        }

        // 2. Drop foreign key constraints referencing users for admin-authored tables (MySQL only)
        if (DB::getDriverName() === 'mysql') {
            try {
                if (Schema::hasTable('inventory_movements')) {
                    Schema::table('inventory_movements', function (Blueprint $table) {
                        $table->dropForeign(['created_by']);
                    });
                }
            } catch (\Throwable $e) {
                // Ignore if constraint doesn't exist
            }

            try {
                if (Schema::hasTable('damage_logs')) {
                    Schema::table('damage_logs', function (Blueprint $table) {
                        $table->dropForeign(['reported_by']);
                    });
                }
            } catch (\Throwable $e) {
                // Ignore
            }

            try {
                if (Schema::hasTable('purchase_orders')) {
                    Schema::table('purchase_orders', function (Blueprint $table) {
                        $table->dropForeign(['created_by']);
                        $table->dropForeign(['received_by']);
                    });
                }
            } catch (\Throwable $e) {
                // Ignore
            }

            try {
                if (Schema::hasTable('supplier_ledgers')) {
                    Schema::table('supplier_ledgers', function (Blueprint $table) {
                        $table->dropForeign(['created_by']);
                    });
                }
            } catch (\Throwable $e) {
                // Ignore
            }

            try {
                if (Schema::hasTable('order_status_histories')) {
                    Schema::table('order_status_histories', function (Blueprint $table) {
                        $table->dropForeign(['user_id']);
                    });
                }
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        // 3. Move existing admin records from users table to admins table
        if (Schema::hasTable('users')) {
            $existingAdmins = DB::table('users')
                ->whereIn('role', ['super_admin', 'admin', 'manager', 'inventory_staff'])
                ->get();

            foreach ($existingAdmins as $admin) {
                DB::table('admins')->updateOrInsert(
                    ['email' => $admin->email],
                    [
                        'name' => $admin->name,
                        'phone' => $admin->phone ?? null,
                        'role' => $admin->role ?? 'admin',
                        'avatar' => $admin->avatar ?? null,
                        'password' => $admin->password ?? Hash::make('password123'),
                        'is_active' => (bool) ($admin->is_active ?? true),
                        'remember_token' => $admin->remember_token ?? null,
                        'created_at' => $admin->created_at ?? now(),
                        'updated_at' => $admin->updated_at ?? now(),
                    ]
                );
            }

            // Remove administrative roles from users table so it remains exclusively for storefront customers
            DB::table('users')
                ->whereIn('role', ['super_admin', 'admin', 'manager', 'inventory_staff'])
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
