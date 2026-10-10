<?php

namespace Tests\Feature;

use App\Models\DamageLog;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase10InventoryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'super_admin']);
        $this->customer = User::factory()->create(['role' => 'customer']);

        $this->product = Product::create([
            'name' => 'Oxford Leather Shoes',
            'slug' => 'oxford-leather-shoes',
            'sku' => 'OXF-SHOE-001',
            'base_price' => 3500.00,
            'sale_price' => 2999.00,
            'cost_price' => 1800.00,
            'stock_quantity' => 10,
            'low_stock_threshold' => 5,
            'is_active' => true,
        ]);
    }

    public function test_inventory_index_renders_with_metrics_for_admin(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/inventory');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Inventory/Index')
            ->has('metrics')
            ->has('stockSummary')
            ->has('ledger')
            ->has('damageLogs')
            ->has('categories')
            ->has('products')
        );
    }

    public function test_admin_can_adjust_stock_increase(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/inventory/adjust', [
            'product_id' => $this->product->id,
            'action' => 'increase',
            'quantity' => 5,
            'reason' => 'Found uncounted stock in warehouse',
            'notes' => 'Found in aisle B-12 during shelf check.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->product->refresh();
        $this->assertEquals(15, $this->product->stock_quantity);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => InventoryMovement::TYPE_ADJUSTMENT_INCREASE,
            'quantity' => 5,
            'quantity_before' => 10,
            'quantity_after' => 15,
            'unit_cost' => 1800.00,
            'total_cost' => 9000.00,
        ]);
    }

    public function test_admin_can_adjust_stock_decrease(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/inventory/adjust', [
            'product_id' => $this->product->id,
            'action' => 'decrease',
            'quantity' => 4,
            'reason' => 'Cycle count discrepancy',
            'notes' => 'Physical count revealed 4 units missing.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->product->refresh();
        $this->assertEquals(6, $this->product->stock_quantity);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => InventoryMovement::TYPE_ADJUSTMENT_DECREASE,
            'quantity' => -4,
            'quantity_before' => 10,
            'quantity_after' => 6,
        ]);
    }

    public function test_stock_decrease_cannot_exceed_available_stock(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        /** @var \App\Services\Inventory\InventoryService $service */
        $service = app(\App\Services\Inventory\InventoryService::class);
        $service->recordAdjustment([
            'product_id' => $this->product->id,
            'action' => 'decrease',
            'quantity' => 20, // Only 10 available
            'reason' => 'Testing over-deduction',
        ], $this->admin->id);
    }

    public function test_admin_can_adjust_stock_with_set_exact_cycle_count(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/inventory/adjust', [
            'product_id' => $this->product->id,
            'action' => 'set_exact',
            'quantity' => 8,
            'reason' => 'Cycle count audit discrepancy',
        ]);

        $response->assertRedirect();

        $this->product->refresh();
        $this->assertEquals(8, $this->product->stock_quantity);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'quantity' => -2,
            'quantity_before' => 10,
            'quantity_after' => 8,
        ]);
    }

    public function test_admin_can_adjust_variant_stock(): void
    {
        $variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'OXF-SHOE-001-42-BLK',
            'size' => '42',
            'color' => 'Black',
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post('/admin/inventory/adjust', [
            'product_id' => $this->product->id,
            'product_variant_id' => $variant->id,
            'action' => 'increase',
            'quantity' => 3,
            'reason' => 'Found uncounted variant stock',
        ]);

        $response->assertRedirect();

        $variant->refresh();
        $this->assertEquals(8, $variant->stock_quantity);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
            'quantity_before' => 5,
            'quantity_after' => 8,
        ]);
    }

    public function test_admin_can_log_damage_stock_write_off(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/inventory/damage', [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'reason' => 'transit_damage',
            'notes' => 'Damaged outer leather during express transport.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->product->refresh();
        $this->assertEquals(8, $this->product->stock_quantity);

        $this->assertDatabaseHas('damage_logs', [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_cost' => 1800.00,
            'total_loss_amount' => 3600.00,
            'reason' => 'transit_damage',
            'status' => 'written_off',
        ]);

        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $this->product->id,
            'type' => InventoryMovement::TYPE_DAMAGE_LOSS,
            'quantity' => -2,
            'quantity_before' => 10,
            'quantity_after' => 8,
        ]);
    }

    public function test_damage_quantity_cannot_exceed_available_stock(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        /** @var \App\Services\Inventory\InventoryService $service */
        $service = app(\App\Services\Inventory\InventoryService::class);
        $service->recordDamage([
            'product_id' => $this->product->id,
            'quantity' => 15, // Only 10 available
            'reason' => 'broken',
        ], $this->admin->id);
    }

    public function test_admin_can_update_product_low_stock_threshold(): void
    {
        $response = $this->actingAs($this->admin)->patch("/admin/inventory/products/{$this->product->id}/threshold", [
            'low_stock_threshold' => 12,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->product->refresh();
        $this->assertEquals(12, $this->product->low_stock_threshold);
    }

    public function test_customer_or_guest_cannot_access_inventory(): void
    {
        $this->get('/admin/inventory')->assertRedirect('/login');

        $this->actingAs($this->customer)->get('/admin/inventory')->assertStatus(403);

        $this->actingAs($this->customer)->post('/admin/inventory/adjust', [
            'product_id' => $this->product->id,
            'action' => 'increase',
            'quantity' => 5,
            'reason' => 'Hacker test',
        ])->assertStatus(403);
    }
}
