<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $coupons = [
            [
                'code' => 'ORIO10',
                'name' => 'Welcome to ORIO Style 10% Off',
                'description' => 'Enjoy 10% off your shopping bag across all contemporary luxury menswear and womenswear collections.',
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'min_order_amount' => 1500.00,
                'max_discount_cap' => 500.00,
                'usage_limit_total' => null,
                'usage_limit_per_user' => 1,
                'times_used' => 14,
                'start_date' => $now->copy()->subMonths(1),
                'end_date' => $now->copy()->addMonths(6),
                'is_active' => true,
            ],
            [
                'code' => 'SAVE15',
                'name' => 'Grand Launch Celebration 15% Off',
                'description' => 'Special launch discount for valued patrons on minimum spends of ৳2,000.',
                'discount_type' => 'percentage',
                'discount_value' => 15.00,
                'min_order_amount' => 2000.00,
                'max_discount_cap' => 750.00,
                'usage_limit_total' => 500,
                'usage_limit_per_user' => 1,
                'times_used' => 38,
                'start_date' => $now->copy()->subDays(15),
                'end_date' => $now->copy()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'LUXURY500',
                'name' => 'Elite Tier ৳500 Flat Savings',
                'description' => 'Exclusive ৳500 instant deduction on orders of ৳4,000 and above for footwear, watches, and premium suits.',
                'discount_type' => 'fixed',
                'discount_value' => 500.00,
                'min_order_amount' => 4000.00,
                'max_discount_cap' => null,
                'usage_limit_total' => 250,
                'usage_limit_per_user' => 2,
                'times_used' => 19,
                'start_date' => $now->copy()->subDays(7),
                'end_date' => $now->copy()->addMonths(4),
                'is_active' => true,
            ],
            [
                'code' => 'FIRSTBUY',
                'name' => 'First Order Welcome Voucher ৳200',
                'description' => 'Flat ৳200 deduction for new customers on orders over ৳1,000.',
                'discount_type' => 'fixed',
                'discount_value' => 200.00,
                'min_order_amount' => 1000.00,
                'max_discount_cap' => null,
                'usage_limit_total' => null,
                'usage_limit_per_user' => 1,
                'times_used' => 62,
                'start_date' => $now->copy()->subMonths(2),
                'end_date' => $now->copy()->addYear(),
                'is_active' => true,
            ],
            [
                'code' => 'FESTIVE20',
                'name' => 'Festive Luxury 20% Off',
                'description' => 'Limited seasonal promotion offering 20% savings up to ৳1,000 on curated formal and occasion wear.',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'min_order_amount' => 3000.00,
                'max_discount_cap' => 1000.00,
                'usage_limit_total' => 1000,
                'usage_limit_per_user' => 1,
                'times_used' => 5,
                'start_date' => $now->copy()->subDays(3),
                'end_date' => $now->copy()->addDays(20),
                'is_active' => true,
            ],
            [
                'code' => 'WINTERPREVIEW',
                'name' => 'Winter Exclusive Preview 25% Off',
                'description' => 'Scheduled promotional code for upcoming Winter outerwear and cashmere collection.',
                'discount_type' => 'percentage',
                'discount_value' => 25.00,
                'min_order_amount' => 5000.00,
                'max_discount_cap' => 1500.00,
                'usage_limit_total' => 200,
                'usage_limit_per_user' => 1,
                'times_used' => 0,
                'start_date' => $now->copy()->addDays(20),
                'end_date' => $now->copy()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'AUTUMN10',
                'name' => 'Past Autumn Clearance 10%',
                'description' => 'Historical promotional code for autumn catalog clearance.',
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'min_order_amount' => 1500.00,
                'max_discount_cap' => 400.00,
                'usage_limit_total' => 100,
                'usage_limit_per_user' => 1,
                'times_used' => 100,
                'start_date' => $now->copy()->subMonths(3),
                'end_date' => $now->copy()->subDays(5),
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(
                ['code' => $coupon['code']],
                $coupon
            );
        }
    }
}
