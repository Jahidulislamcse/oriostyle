<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase17OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;
    protected Product $product;

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

        $this->product = Product::create([
            'name' => 'Royal Embroidered Thobe',
            'slug' => 'royal-embroidered-thobe',
            'sku' => 'THB-ROY-001',
            'base_price' => 3500.00,
            'stock_quantity' => 20,
            'low_stock_threshold' => 5,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_orders_index_with_metrics_and_list(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261021-0001',
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Banani, Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 3500.00,
            'shipping_charge' => 60.00,
            'discount_amount' => 0.00,
            'total_amount' => 3560.00,
            'currency' => 'BDT',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'unit_price' => 3500.00,
            'quantity' => 1,
            'line_total' => 3500.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.orders.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Orders/Index')
            ->has('orders.data', 1)
            ->where('metrics.total_orders', 1)
            ->where('metrics.pending_orders', 1)
            ->has('orderStatuses')
            ->has('paymentStatuses')
        );
    }

    public function test_admin_can_filter_orders_by_search_and_status(): void
    {
        Order::create([
            'order_number' => 'ORD-20261021-1001',
            'customer_name' => 'Fahim Morshed',
            'customer_phone' => '01899112233',
            'shipping_address' => 'Nasirabad, Chittagong',
            'city' => 'Chittagong',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 3500.00,
            'shipping_charge' => 120.00,
            'total_amount' => 3620.00,
        ]);

        Order::create([
            'order_number' => 'ORD-20261021-1002',
            'customer_name' => 'Sadia Afrin',
            'customer_phone' => '01988334455',
            'shipping_address' => 'Mirpur, Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_BKASH,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_DELIVERED,
            'subtotal' => 7000.00,
            'shipping_charge' => 60.00,
            'total_amount' => 7060.00,
        ]);

        // Search by customer name
        $searchRes = $this->actingAs($this->adminUser)
            ->get(route('admin.orders.index', ['search' => 'Fahim']));
        $searchRes->assertOk();
        $searchRes->assertInertia(fn ($page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.customer_name', 'Fahim Morshed')
        );

        // Filter by delivered status
        $statusRes = $this->actingAs($this->adminUser)
            ->get(route('admin.orders.index', ['status' => Order::STATUS_DELIVERED]));
        $statusRes->assertOk();
        $statusRes->assertInertia(fn ($page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.order_number', 'ORD-20261021-1002')
        );
    }

    public function test_admin_can_view_detailed_order_with_items(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261021-5001',
            'customer_name' => 'Mahmudul Hasan',
            'customer_phone' => '01700112233',
            'shipping_address' => 'Shantinagar, Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 3500.00,
            'shipping_charge' => 60.00,
            'total_amount' => 3560.00,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_sku' => $this->product->sku,
            'variant_attributes' => ['size' => 'L', 'color' => 'Navy'],
            'unit_price' => 3500.00,
            'quantity' => 1,
            'line_total' => 3500.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.orders.show', $order->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Orders/Show')
            ->where('order.order_number', 'ORD-20261021-5001')
            ->has('order.items', 1)
            ->where('order.items.0.product_name', 'Royal Embroidered Thobe')
        );
    }

    public function test_admin_can_update_order_workflow_status(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261021-6001',
            'customer_name' => 'Kamrul Islam',
            'customer_phone' => '01711998877',
            'shipping_address' => 'Sylhet, Bangladesh',
            'city' => 'Sylhet',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 2000.00,
            'shipping_charge' => 120.00,
            'total_amount' => 2120.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.orders.status', $order->id), [
                'order_status' => Order::STATUS_CONFIRMED,
                'admin_notes' => 'Customer phone verified by staff.',
            ]);

        $response->assertRedirect();
        $order->refresh();
        $this->assertEquals(Order::STATUS_CONFIRMED, $order->order_status);
        $this->assertNotNull($order->confirmed_at);
        $this->assertEquals('Customer phone verified by staff.', $order->admin_notes);
    }

    public function test_marking_cod_order_delivered_automatically_marks_payment_paid(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261021-7001',
            'customer_name' => 'Zubair Hossain',
            'customer_phone' => '01855667788',
            'shipping_address' => 'Dhanmondi, Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_SHIPPED,
            'subtotal' => 4500.00,
            'shipping_charge' => 60.00,
            'total_amount' => 4560.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.orders.status', $order->id), [
                'order_status' => Order::STATUS_DELIVERED,
                'admin_notes' => 'Steadfast reported delivered and collected cash.',
            ]);

        $response->assertRedirect();
        $order->refresh();
        $this->assertEquals(Order::STATUS_DELIVERED, $order->order_status);
        $this->assertEquals(Order::PAYMENT_PAID, $order->payment_status);
        $this->assertNotNull($order->delivered_at);
    }

    public function test_admin_can_update_payment_status(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261021-8001',
            'customer_name' => 'Nasreen Sultana',
            'customer_phone' => '01911223344',
            'shipping_address' => 'Uttara, Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_BKASH,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 5000.00,
            'total_amount' => 5060.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.orders.payment', $order->id), [
                'payment_status' => Order::PAYMENT_PAID,
                'admin_notes' => 'bKash TrxID: 8JH991L confirmed manually.',
            ]);

        $response->assertRedirect();
        $order->refresh();
        $this->assertEquals(Order::PAYMENT_PAID, $order->payment_status);
    }

    public function test_admin_can_render_invoice_sheet(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-20261021-9001',
            'customer_name' => 'Tanvir Ahmed',
            'customer_phone' => '01711223344',
            'shipping_address' => 'Banani, Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_DELIVERED,
            'subtotal' => 3500.00,
            'total_amount' => 3560.00,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'unit_price' => 3500.00,
            'quantity' => 1,
            'line_total' => 3500.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.orders.invoice', $order->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Orders/Invoice')
            ->where('order.order_number', 'ORD-20261021-9001')
        );
    }

    public function test_dashboard_reflects_real_orders_and_revenue(): void
    {
        Order::create([
            'order_number' => 'ORD-20261021-9901',
            'customer_name' => 'Client A',
            'customer_phone' => '01700000000',
            'shipping_address' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 1000.00,
            'total_amount' => 1060.00,
        ]);

        Order::create([
            'order_number' => 'ORD-20261021-9902',
            'customer_name' => 'Client B',
            'customer_phone' => '01800000000',
            'shipping_address' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => Order::METHOD_BKASH,
            'payment_status' => Order::PAYMENT_PAID,
            'order_status' => Order::STATUS_DELIVERED,
            'subtotal' => 2000.00,
            'total_amount' => 2060.00,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('metrics.totalOrders', 2)
            ->where('metrics.pendingOrders', 1)
            ->where('metrics.todayRevenue', fn ($val) => (float) $val === 2060.0)
            ->has('recentOrders', 2)
        );
    }

    public function test_non_admin_cannot_access_orders_management(): void
    {
        $guestRes = $this->get(route('admin.orders.index'));
        $guestRes->assertRedirect(route('login'));

        $customerRes = $this->actingAs($this->customerUser)
            ->get(route('admin.orders.index'));
        $customerRes->assertForbidden();
    }
}
