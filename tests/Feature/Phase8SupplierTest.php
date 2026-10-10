<?php

namespace Tests\Feature;

use App\Models\Supplier;
use App\Models\SupplierLedger;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase8SupplierTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->customer = User::factory()->create([
            'role' => 'customer',
            'is_active' => true,
        ]);
    }

    public function test_suppliers_index_renders_with_metrics_for_admin(): void
    {
        Supplier::create([
            'name' => 'Apex Fabrics Ltd.',
            'company_name' => 'Apex Holding',
            'phone' => '+8801700112233',
            'opening_balance' => 50000.00,
            'current_balance' => 50000.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/suppliers');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Suppliers/Index')
            ->has('suppliers.data', 1)
            ->where('metrics.total_suppliers', 1)
            ->where('metrics.active_suppliers', 1)
            ->where('metrics.total_payable', 50000)
        );
    }

    public function test_admin_can_create_supplier_with_opening_balance_and_auto_ledger_entry(): void
    {
        $payload = [
            'name' => 'Beximco Textiles',
            'company_name' => 'Beximco Group',
            'email' => 'contact@beximco.com',
            'phone' => '+8801811223344',
            'city' => 'Gazipur',
            'country' => 'Bangladesh',
            'opening_balance' => 75000.00,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)->post('/admin/suppliers', $payload);

        $response->assertRedirect('/admin/suppliers');
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Beximco Textiles',
            'company_name' => 'Beximco Group',
            'phone' => '+8801811223344',
            'opening_balance' => 75000.00,
            'current_balance' => 75000.00,
        ]);

        $supplier = Supplier::where('name', 'Beximco Textiles')->first();
        $this->assertNotNull($supplier);

        // Verify automated opening balance ledger record
        $this->assertDatabaseHas('supplier_ledgers', [
            'supplier_id' => $supplier->id,
            'transaction_type' => 'opening_balance',
            'credit' => 75000.00,
            'debit' => 0.00,
            'balance' => 75000.00,
        ]);
    }

    public function test_admin_can_update_supplier_attributes(): void
    {
        $supplier = Supplier::create([
            'name' => 'Square Yarns',
            'phone' => '+8801755667788',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->put("/admin/suppliers/{$supplier->id}", [
            'name' => 'Square Yarns & Fabrics Ltd.',
            'company_name' => 'Square Group',
            'phone' => '+8801755667788',
            'city' => 'Pabna',
            'country' => 'Bangladesh',
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Square Yarns & Fabrics Ltd.',
            'company_name' => 'Square Group',
            'city' => 'Pabna',
        ]);
    }

    public function test_admin_can_toggle_supplier_active_status(): void
    {
        $supplier = Supplier::create([
            'name' => 'Vintage Accessories',
            'phone' => '+8801999887766',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->patch("/admin/suppliers/{$supplier->id}/toggle-active");

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_record_payment_and_recalculate_payable_balance(): void
    {
        $supplier = Supplier::create([
            'name' => 'Dhaka Buttons Co.',
            'phone' => '+8801666554433',
            'opening_balance' => 20000.00,
            'current_balance' => 20000.00,
        ]);

        // Post 8,000 payment (debit) to supplier
        $response = $this->actingAs($this->admin)->post("/admin/suppliers/{$supplier->id}/payments", [
            'transaction_type' => 'payment',
            'amount' => 8000.00,
            'payment_method' => 'bank_transfer',
            'reference_no' => 'TRX-998822',
            'transaction_date' => now()->toDateString(),
            'notes' => 'Partial vendor bill clearance',
        ]);

        $response->assertSessionHas('success');

        // Remaining balance should be 20000 - 8000 = 12000
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'current_balance' => 12000.00,
        ]);

        $this->assertDatabaseHas('supplier_ledgers', [
            'supplier_id' => $supplier->id,
            'transaction_type' => 'payment',
            'debit' => 8000.00,
            'credit' => 0.00,
            'balance' => 12000.00,
            'reference_no' => 'TRX-998822',
        ]);
    }

    public function test_supplier_ledger_tracks_running_balance_across_multiple_transactions(): void
    {
        $supplier = Supplier::create([
            'name' => 'Noman Packaging',
            'phone' => '+8801555443322',
            'opening_balance' => 0.00,
            'current_balance' => 0.00,
        ]);

        // Transaction 1: Bill / purchase of 30,000 (credit) -> balance becomes 30,000
        $this->actingAs($this->admin)->post("/admin/suppliers/{$supplier->id}/payments", [
            'transaction_type' => 'bill',
            'amount' => 30000.00,
            'transaction_date' => now()->subDays(5)->toDateString(),
            'notes' => 'Poly bags and cartons delivery',
        ]);

        $supplier->refresh();
        $this->assertEquals(30000.00, (float) $supplier->current_balance);

        // Transaction 2: Payment of 10,000 (debit) -> balance becomes 20,000
        $this->actingAs($this->admin)->post("/admin/suppliers/{$supplier->id}/payments", [
            'transaction_type' => 'payment',
            'amount' => 10000.00,
            'transaction_date' => now()->subDays(3)->toDateString(),
            'notes' => 'Cheque clearance',
        ]);

        $supplier->refresh();
        $this->assertEquals(20000.00, (float) $supplier->current_balance);

        // Transaction 3: Return credit of 2,000 (debit) -> balance becomes 18,000
        $this->actingAs($this->admin)->post("/admin/suppliers/{$supplier->id}/payments", [
            'transaction_type' => 'return',
            'amount' => 2000.00,
            'transaction_date' => now()->toDateString(),
            'notes' => 'Defective cartons returned',
        ]);

        $supplier->refresh();
        $this->assertEquals(18000.00, (float) $supplier->current_balance);
        $this->assertCount(3, $supplier->ledgers);
    }

    public function test_admin_can_view_supplier_show_statement_page(): void
    {
        $supplier = Supplier::create([
            'name' => 'Zaber & Zubair Fabrics',
            'phone' => '+8801888776655',
            'opening_balance' => 100000.00,
            'current_balance' => 100000.00,
        ]);

        SupplierLedger::create([
            'supplier_id' => $supplier->id,
            'transaction_type' => 'opening_balance',
            'credit' => 100000.00,
            'debit' => 0.00,
            'balance' => 100000.00,
            'transaction_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Suppliers/Show')
            ->where('supplier.name', 'Zaber & Zubair Fabrics')
            ->has('ledger.data', 1)
        );
    }

    public function test_customer_or_guest_cannot_access_suppliers_management(): void
    {
        // Guest redirect
        $this->get('/admin/suppliers')->assertRedirect('/login');

        // Customer forbidden 403
        $this->actingAs($this->customer)->get('/admin/suppliers')->assertStatus(403);
    }
}
