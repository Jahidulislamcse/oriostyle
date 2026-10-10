<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\SupplierLedger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase9PurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;
    protected Supplier $supplier;
    protected Product $product;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $this->customerUser = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
        ]);

        $this->supplier = Supplier::create([
            'name' => 'Dhaka Textile Mills Ltd.',
            'company_name' => 'Dhaka Textile Ltd.',
            'phone' => '+8801711234567',
            'opening_balance' => 50000.00,
            'current_balance' => 50000.00,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'name' => 'Royal Oxford Cotton Shirt',
            'slug' => 'royal-oxford-cotton-shirt',
            'sku' => 'MSH-OXF-001',
            'base_price' => 3200.00,
            'cost_price' => 1000.00,
            'stock_quantity' => 10,
            'low_stock_threshold' => 5,
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'MSH-OXF-001-WHT-40',
            'size' => '40',
            'color' => 'White',
            'stock_quantity' => 5,
            'is_active' => true,
        ]);
    }

    public function test_purchase_orders_index_renders_with_metrics_for_admin(): void
    {
        PurchaseOrder::create([
            'po_number' => 'PO-2026-0001',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_ORDERED,
            'order_date' => now()->toDateString(),
            'subtotal' => 5000.00,
            'total_amount' => 5000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.purchase-orders.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/PurchaseOrders/Index')
            ->has('purchaseOrders.data', 1)
            ->has('metrics')
            ->where('metrics.pending_orders', 1)
        );
    }

    public function test_admin_can_create_purchase_order_with_line_items(): void
    {
        $payload = [
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'expected_delivery_date' => now()->addDays(7)->toDateString(),
            'shipping_cost' => 500.00,
            'tax_amount' => 0.00,
            'discount_amount' => 200.00,
            'notes' => 'Urgent replenishment batch',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'product_variant_id' => $this->variant->id,
                    'quantity_ordered' => 20,
                    'unit_cost' => 1200.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.purchase-orders.store'), $payload);

        $this->assertDatabaseHas('purchase_orders', [
            'supplier_id' => $this->supplier->id,
            'subtotal' => 24000.00, // 20 * 1200
            'shipping_cost' => 500.00,
            'discount_amount' => 200.00,
            'total_amount' => 24300.00, // 24000 + 500 - 200
            'status' => PurchaseOrder::STATUS_DRAFT,
        ]);

        $po = PurchaseOrder::first();
        $response->assertRedirect(route('admin.purchase-orders.show', $po->id));

        $this->assertDatabaseHas('purchase_order_items', [
            'purchase_order_id' => $po->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity_ordered' => 20,
            'unit_cost' => 1200.00,
            'subtotal' => 24000.00,
        ]);
    }

    public function test_admin_can_update_draft_purchase_order(): void
    {
        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0002',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_DRAFT,
            'order_date' => now()->toDateString(),
            'subtotal' => 12000.00,
            'total_amount' => 12000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $po->items()->create([
            'product_id' => $this->product->id,
            'quantity_ordered' => 10,
            'unit_cost' => 1200.00,
            'subtotal' => 12000.00,
        ]);

        $updatePayload = [
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->toDateString(),
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity_ordered' => 15,
                    'unit_cost' => 1100.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.purchase-orders.update', $po->id), $updatePayload);

        $response->assertRedirect(route('admin.purchase-orders.show', $po->id));

        $this->assertDatabaseHas('purchase_orders', [
            'id' => $po->id,
            'subtotal' => 16500.00, // 15 * 1100
            'total_amount' => 16500.00,
        ]);
    }

    public function test_admin_can_mark_draft_purchase_order_as_ordered(): void
    {
        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0003',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_DRAFT,
            'order_date' => now()->toDateString(),
            'subtotal' => 5000.00,
            'total_amount' => 5000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.purchase-orders.order', $po->id));

        $response->assertSessionHas('success');
        $this->assertEquals(PurchaseOrder::STATUS_ORDERED, $po->fresh()->status);
    }

    public function test_receiving_purchase_order_hydrates_product_and_variant_stock(): void
    {
        // Initial state: Product stock = 10, Variant stock = 5
        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0004',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_ORDERED,
            'order_date' => now()->toDateString(),
            'subtotal' => 15000.00,
            'total_amount' => 15000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $po->items()->create([
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity_ordered' => 10,
            'unit_cost' => 1500.00,
            'subtotal' => 15000.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.purchase-orders.receive', $po->id), [
                'received_date' => now()->toDateString(),
            ]);

        $response->assertSessionHas('success');

        // Master product stock should be 10 + 10 = 20
        $this->assertEquals(20, $this->product->fresh()->stock_quantity);

        // Variant stock should be 5 + 10 = 15
        $this->assertEquals(15, $this->variant->fresh()->stock_quantity);

        // PO status should be received
        $this->assertEquals(PurchaseOrder::STATUS_RECEIVED, $po->fresh()->status);
    }

    public function test_receiving_purchase_order_updates_weighted_average_cogs(): void
    {
        // Initial state:
        // Product stock = 10, cost_price = 1000.00
        // New receipt:
        // Quantity = 10, unit_cost = 1600.00
        // Expected weighted cost = ((10 * 1000) + (10 * 1600)) / (10 + 10) = 26000 / 20 = 1300.00

        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0005',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_ORDERED,
            'order_date' => now()->toDateString(),
            'subtotal' => 16000.00,
            'total_amount' => 16000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $po->items()->create([
            'product_id' => $this->product->id,
            'quantity_ordered' => 10,
            'unit_cost' => 1600.00,
            'subtotal' => 16000.00,
        ]);

        $this->actingAs($this->adminUser)
            ->post(route('admin.purchase-orders.receive', $po->id));

        $this->assertEquals(1300.00, (float) $this->product->fresh()->cost_price);
    }

    public function test_receiving_purchase_order_posts_bill_to_supplier_ledger_and_updates_payable_balance(): void
    {
        // Initial supplier balance: 50,000.00
        $poAmount = 25000.00;

        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0006',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_ORDERED,
            'order_date' => now()->toDateString(),
            'subtotal' => $poAmount,
            'total_amount' => $poAmount,
            'created_by' => $this->adminUser->id,
        ]);

        $po->items()->create([
            'product_id' => $this->product->id,
            'quantity_ordered' => 20,
            'unit_cost' => 1250.00,
            'subtotal' => $poAmount,
        ]);

        $this->actingAs($this->adminUser)
            ->post(route('admin.purchase-orders.receive', $po->id));

        // Supplier payable balance should now be 50,000 + 25,000 = 75,000
        $this->assertEquals(75000.00, (float) $this->supplier->fresh()->current_balance);

        // Supplier Ledger should have a bill record
        $this->assertDatabaseHas('supplier_ledgers', [
            'supplier_id' => $this->supplier->id,
            'transaction_type' => 'bill',
            'reference_no' => 'PO-2026-0006',
            'credit' => 25000.00,
            'debit' => 0.00,
            'balance' => 75000.00,
        ]);
    }

    public function test_cancelling_purchase_order_prevents_stock_hydration(): void
    {
        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0007',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_ORDERED,
            'order_date' => now()->toDateString(),
            'subtotal' => 10000.00,
            'total_amount' => 10000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.purchase-orders.cancel', $po->id), [
                'reason' => 'Vendor out of stock',
            ]);

        $response->assertSessionHas('success');
        $this->assertEquals(PurchaseOrder::STATUS_CANCELLED, $po->fresh()->status);

        // Product stock remains untouched
        $this->assertEquals(10, $this->product->fresh()->stock_quantity);
    }

    public function test_cannot_delete_received_purchase_order(): void
    {
        $po = PurchaseOrder::create([
            'po_number' => 'PO-2026-0008',
            'supplier_id' => $this->supplier->id,
            'status' => PurchaseOrder::STATUS_RECEIVED,
            'order_date' => now()->toDateString(),
            'subtotal' => 10000.00,
            'total_amount' => 10000.00,
            'created_by' => $this->adminUser->id,
        ]);

        $this->expectException(\InvalidArgumentException::class);

        app(\App\Services\Procurement\PurchaseOrderService::class)->deletePurchaseOrder($po);
    }

    public function test_customer_or_guest_cannot_access_purchase_orders(): void
    {
        // Guest
        $guestResponse = $this->get(route('admin.purchase-orders.index'));
        $guestResponse->assertRedirect(route('login'));

        // Customer
        $customerResponse = $this->actingAs($this->customerUser)
            ->get(route('admin.purchase-orders.index'));
        $customerResponse->assertForbidden();
    }
}
