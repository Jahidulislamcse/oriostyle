<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;
use App\Services\Procurement\PurchaseOrderService;
use Illuminate\Database\Seeder;

class PurchaseOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(PurchaseOrderService $poService): void
    {
        $admin = User::whereIn('role', [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN])->first();
        $adminId = $admin?->id;

        $suppliers = Supplier::all()->keyBy('email');
        $products = Product::with('variants')->get()->keyBy('slug');

        if ($suppliers->isEmpty() || $products->isEmpty()) {
            return;
        }

        $dhakaMill = $suppliers->get('kabir@dhakatextile.com') ?? $suppliers->first();
        $bengalTannery = $suppliers->get('faruk@bengaltannery.com') ?? $suppliers->skip(1)->first() ?? $suppliers->first();
        $ctgGuild = $suppliers->get('morshed@ctgloom.org') ?? $suppliers->last();

        $shirtProd = $products->get('royal-oxford-tailored-formal-shirt') ?? $products->first();
        $poloProd = $products->get('signature-pique-cotton-polo-shirt') ?? $products->skip(1)->first() ?? $products->first();
        $oxfordShoeProd = $products->get('handcrafted-cap-toe-leather-oxford-shoes') ?? $products->first();
        $sareeProd = $products->get('artisanal-dhakai-jamdani-handloom-saree') ?? $products->first();

        // 1. Received Purchase Order (Stock Hydrated & Bill Recorded)
        if ($dhakaMill && $shirtProd && !PurchaseOrder::where('po_number', 'PO-2026-0001')->exists()) {
            $po1 = $poService->createPurchaseOrder([
                'po_number' => 'PO-2026-0001',
                'supplier_id' => $dhakaMill->id,
                'status' => PurchaseOrder::STATUS_ORDERED,
                'order_date' => '2026-09-01',
                'expected_delivery_date' => '2026-09-08',
                'shipping_cost' => 1500.00,
                'discount_amount' => 500.00,
                'notes' => 'Bulk supply of executive cotton shirts and pique knit polos for autumn stock.',
                'items' => [
                    [
                        'product_id' => $shirtProd->id,
                        'product_variant_id' => $shirtProd->variants->first()?->id,
                        'quantity_ordered' => 25,
                        'unit_cost' => 1400.00,
                    ],
                    [
                        'product_id' => $poloProd->id,
                        'product_variant_id' => $poloProd->variants->first()?->id,
                        'quantity_ordered' => 30,
                        'unit_cost' => 750.00,
                    ],
                ],
            ], $adminId);

            // Mark received to hydrate stock & post bill
            $poService->receivePurchaseOrder($po1, $adminId, '2026-09-08');
        }

        // 2. In-Transit / Ordered Purchase Order
        if ($bengalTannery && $oxfordShoeProd && !PurchaseOrder::where('po_number', 'PO-2026-0002')->exists()) {
            $poService->createPurchaseOrder([
                'po_number' => 'PO-2026-0002',
                'supplier_id' => $bengalTannery->id,
                'status' => PurchaseOrder::STATUS_ORDERED,
                'order_date' => '2026-10-02',
                'expected_delivery_date' => '2026-10-18',
                'shipping_cost' => 2000.00,
                'discount_amount' => 0.00,
                'notes' => 'Custom burnished dress shoes consignment currently under factory quality check.',
                'items' => [
                    [
                        'product_id' => $oxfordShoeProd->id,
                        'product_variant_id' => $oxfordShoeProd->variants->first()?->id,
                        'quantity_ordered' => 15,
                        'unit_cost' => 3600.00,
                    ],
                ],
            ], $adminId);
        }

        // 3. Draft Purchase Order
        if ($ctgGuild && $sareeProd && !PurchaseOrder::where('po_number', 'PO-2026-0003')->exists()) {
            $poService->createPurchaseOrder([
                'po_number' => 'PO-2026-0003',
                'supplier_id' => $ctgGuild->id,
                'status' => PurchaseOrder::STATUS_DRAFT,
                'order_date' => now()->toDateString(),
                'expected_delivery_date' => now()->addDays(14)->toDateString(),
                'shipping_cost' => 800.00,
                'discount_amount' => 1000.00,
                'notes' => 'Festive wedding collection requisition waiting for management approval.',
                'items' => [
                    [
                        'product_id' => $sareeProd->id,
                        'product_variant_id' => $sareeProd->variants->first()?->id,
                        'quantity_ordered' => 8,
                        'unit_cost' => 6200.00,
                    ],
                ],
            ], $adminId);
        }
    }
}
