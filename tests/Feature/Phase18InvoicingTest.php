<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Settings\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase18InvoicingTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Product $product;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $this->customer = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'name' => 'Royal Silk Punjabi',
            'slug' => 'royal-silk-punjabi',
            'sku' => 'PNJ-SLK-001',
            'base_price' => 4500.00,
            'cost_price' => 2200.00,
            'stock_quantity' => 25,
            'low_stock_threshold' => 5,
            'is_active' => true,
        ]);

        $this->order = Order::create([
            'order_number' => 'ORD-20261101-9001',
            'user_id' => $this->customer->id,
            'customer_name' => 'Tariqul Islam',
            'customer_email' => 'tariqul@example.com',
            'customer_phone' => '01755667788',
            'shipping_address' => 'Road 27, House 5, Gulshan-1',
            'city' => 'Inside Dhaka',
            'zone' => 'Dhaka City',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_CONFIRMED,
            'subtotal' => 4500.00,
            'shipping_charge' => 70.00,
            'discount_amount' => 200.00,
            'total_amount' => 4370.00,
            'currency' => 'BDT',
            'customer_notes' => 'Please deliver after 4 PM.',
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'product_name' => 'Royal Silk Punjabi',
            'product_sku' => 'PNJ-SLK-001',
            'variant_attributes' => ['Size' => 'XL', 'Color' => 'Midnight Blue'],
            'unit_price' => 4500.00,
            'quantity' => 1,
            'line_total' => 4500.00,
        ]);
    }

    public function test_admin_can_view_order_invoice_sheet(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.orders.invoice', $this->order->id));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Orders/Invoice')
            ->where('order.id', $this->order->id)
            ->where('order.order_number', 'ORD-20261101-9001')
            ->where('order.customer_name', 'Tariqul Islam')
            ->where('order.total_amount', '4370.00')
            ->has('order.items', 1)
        );
    }

    public function test_customer_cannot_access_admin_invoice(): void
    {
        $response = $this->actingAs($this->customer)->get(route('admin.orders.invoice', $this->order->id));

        $response->assertForbidden();
    }

    public function test_guest_cannot_access_admin_invoice(): void
    {
        $response = $this->get(route('admin.orders.invoice', $this->order->id));

        $response->assertRedirect(route('login'));
    }

    public function test_invoice_returns_404_for_non_existent_order(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/orders/99999/invoice');

        $response->assertNotFound();
    }
}
