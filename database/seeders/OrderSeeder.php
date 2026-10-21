<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Don't duplicate if orders already seeded
        if (Order::count() > 0) {
            return;
        }

        $customer = User::where('role', User::ROLE_CUSTOMER)->first();
        $products = Product::with(['variants', 'primaryImage'])->take(8)->get();

        if ($products->isEmpty()) {
            return;
        }

        $sampleOrders = [
            [
                'order_number' => 'ORD-20261021-1001',
                'customer_name' => 'Tanvir Ahmed',
                'customer_email' => 'tanvir.ahmed@example.com',
                'customer_phone' => '01712-345678',
                'shipping_address' => 'House 42, Road 11, Block D, Banani',
                'city' => 'Dhaka',
                'zone' => 'Banani',
                'postal_code' => '1213',
                'payment_method' => 'cod',
                'payment_status' => 'unpaid',
                'order_status' => 'pending',
                'customer_notes' => 'Please call before delivery. Office hours prefered.',
                'admin_notes' => null,
                'shipping_charge' => 60.00,
                'discount_amount' => 0.00,
                'days_ago' => 0,
            ],
            [
                'order_number' => 'ORD-20261021-1002',
                'customer_name' => 'Mahmudul Hasan',
                'customer_email' => 'mahmud.hasan@example.com',
                'customer_phone' => '01819-876543',
                'shipping_address' => 'Apartment 5B, Concord Tower, Shantinagar',
                'city' => 'Dhaka',
                'zone' => 'Shantinagar',
                'postal_code' => '1217',
                'payment_method' => 'bkash',
                'payment_status' => 'paid',
                'order_status' => 'confirmed',
                'customer_notes' => 'Left at reception if unavailable.',
                'admin_notes' => 'bKash TrxID: 9JK28M74 confirmed with merchant portal.',
                'shipping_charge' => 60.00,
                'discount_amount' => 150.00,
                'days_ago' => 1,
            ],
            [
                'order_number' => 'ORD-20261021-1003',
                'customer_name' => 'Nasreen Sultana',
                'customer_email' => 'nasreen.sultana@example.com',
                'customer_phone' => '01911-223344',
                'shipping_address' => 'Plot 15, Sector 7, Uttara Model Town',
                'city' => 'Dhaka',
                'zone' => 'Uttara',
                'postal_code' => '1230',
                'payment_method' => 'cod',
                'payment_status' => 'unpaid',
                'order_status' => 'processing',
                'customer_notes' => null,
                'admin_notes' => 'Quality check completed. Handed to packaging desk.',
                'shipping_charge' => 60.00,
                'discount_amount' => 0.00,
                'days_ago' => 2,
            ],
            [
                'order_number' => 'ORD-20261021-1004',
                'customer_name' => 'Fahim Morshed',
                'customer_email' => 'fahim.morshed@example.com',
                'customer_phone' => '01678-901234',
                'shipping_address' => 'Holding 22/A, GEC Circle, Nasirabad',
                'city' => 'Chittagong',
                'zone' => 'Nasirabad',
                'postal_code' => '4000',
                'payment_method' => 'cod',
                'payment_status' => 'unpaid',
                'order_status' => 'shipped',
                'customer_notes' => 'Please deliver in afternoon.',
                'admin_notes' => 'Dispatched via Steadfast Courier. Consignment: ST-998241',
                'shipping_charge' => 120.00,
                'discount_amount' => 0.00,
                'days_ago' => 3,
            ],
            [
                'order_number' => 'ORD-20261021-1005',
                'customer_name' => 'Zubair Hossain',
                'customer_email' => 'zubair.hossain@example.com',
                'customer_phone' => '01755-667788',
                'shipping_address' => 'House 18, Road 3, Dhanmondi',
                'city' => 'Dhaka',
                'zone' => 'Dhanmondi',
                'postal_code' => '1205',
                'payment_method' => 'cod',
                'payment_status' => 'paid',
                'order_status' => 'delivered',
                'customer_notes' => null,
                'admin_notes' => 'Delivered on time. Cash collected by courier.',
                'shipping_charge' => 60.00,
                'discount_amount' => 0.00,
                'days_ago' => 5,
            ],
            [
                'order_number' => 'ORD-20261021-1006',
                'customer_name' => 'Kamrul Islam',
                'customer_email' => 'kamrul.islam@example.com',
                'customer_phone' => '01833-445566',
                'shipping_address' => 'Shahjalal Upashahar, Block B',
                'city' => 'Sylhet',
                'zone' => 'Upashahar',
                'postal_code' => '3100',
                'payment_method' => 'bkash',
                'payment_status' => 'paid',
                'order_status' => 'delivered',
                'customer_notes' => 'Gift packaging appreciated.',
                'admin_notes' => 'Delivered. Client expressed gratitude.',
                'shipping_charge' => 120.00,
                'discount_amount' => 200.00,
                'days_ago' => 7,
            ],
            [
                'order_number' => 'ORD-20261021-1007',
                'customer_name' => 'Sadia Afrin',
                'customer_email' => 'sadia.afrin@example.com',
                'customer_phone' => '01922-334455',
                'shipping_address' => 'House 7, Road 5, Mirpur DOHS',
                'city' => 'Dhaka',
                'zone' => 'Mirpur DOHS',
                'postal_code' => '1216',
                'payment_method' => 'cod',
                'payment_status' => 'unpaid',
                'order_status' => 'cancelled',
                'customer_notes' => null,
                'admin_notes' => 'Customer requested cancellation over phone due to accidental duplicate order.',
                'shipping_charge' => 60.00,
                'discount_amount' => 0.00,
                'days_ago' => 4,
            ],
        ];

        foreach ($sampleOrders as $index => $data) {
            $createdTime = now()->subDays($data['days_ago'])->subHours(rand(1, 10));

            // Select 1 to 3 products for this order
            $orderProductCount = ($index % 3) + 1;
            $selectedProducts = $products->slice(($index * 2) % $products->count(), $orderProductCount);
            if ($selectedProducts->isEmpty()) {
                $selectedProducts = $products->take(1);
            }

            $order = Order::create([
                'order_number' => $data['order_number'],
                'user_id' => ($index % 2 === 0 && $customer) ? $customer->id : null,
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'],
                'shipping_address' => $data['shipping_address'],
                'city' => $data['city'],
                'zone' => $data['zone'],
                'postal_code' => $data['postal_code'],
                'payment_method' => $data['payment_method'],
                'payment_status' => $data['payment_status'],
                'order_status' => $data['order_status'],
                'subtotal' => 0, // will calculate below
                'shipping_charge' => $data['shipping_charge'],
                'discount_amount' => $data['discount_amount'],
                'total_amount' => 0, // will calculate below
                'currency' => 'BDT',
                'customer_notes' => $data['customer_notes'],
                'admin_notes' => $data['admin_notes'],
                'confirmed_at' => in_array($data['order_status'], ['confirmed', 'processing', 'shipped', 'delivered']) ? $createdTime->copy()->addMinutes(30) : null,
                'shipped_at' => in_array($data['order_status'], ['shipped', 'delivered']) ? $createdTime->copy()->addHours(6) : null,
                'delivered_at' => $data['order_status'] === 'delivered' ? $createdTime->copy()->addDays(2) : null,
                'cancelled_at' => $data['order_status'] === 'cancelled' ? $createdTime->copy()->addHours(2) : null,
                'created_at' => $createdTime,
                'updated_at' => $createdTime,
            ]);

            $subtotal = 0;
            foreach ($selectedProducts as $pIdx => $prod) {
                $variant = $prod->variants->first();
                $unitPrice = $prod->sale_price ?: $prod->base_price;
                $qty = ($pIdx === 0 && $index % 2 === 0) ? 2 : 1;
                $lineTotal = $unitPrice * $qty;
                $subtotal += $lineTotal;

                $variantAttrs = null;
                if ($variant) {
                    if ($variant->size || $variant->color) {
                        $variantAttrs = array_filter([
                            'size' => $variant->size,
                            'color' => $variant->color,
                        ]);
                    }
                }

                $imagePath = $prod->primaryImage?->image_path ?: ($prod->images->first()?->image_path ?: null);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $prod->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $prod->name,
                    'product_sku' => $variant?->sku ?: $prod->sku,
                    'variant_attributes' => $variantAttrs,
                    'unit_price' => $unitPrice,
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                    'image_path' => $imagePath,
                    'created_at' => $createdTime,
                    'updated_at' => $createdTime,
                ]);
            }

            $totalAmount = max(0, $subtotal + $data['shipping_charge'] - $data['discount_amount']);
            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $totalAmount,
            ]);
        }
    }
}
