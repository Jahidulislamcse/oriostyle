<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $otherCustomer;
    protected Order $order;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->create([
            'name' => 'Fahim Rahman',
            'email' => 'fahim@example.com',
            'phone' => '01711223344',
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
        ]);

        $this->otherCustomer = User::factory()->create([
            'name' => 'Sara Khan',
            'email' => 'sara@example.com',
            'phone' => '01899887766',
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'name' => 'Classic Oxford Shirt',
            'slug' => 'classic-oxford-shirt',
            'sku' => 'SHIRT-OXF-001',
            'base_price' => 2400.00,
            'stock_quantity' => 50,
            'low_stock_threshold' => 10,
            'is_active' => true,
        ]);

        $this->order = Order::create([
            'order_number' => 'ORD-20261101-1001',
            'user_id' => $this->customer->id,
            'customer_name' => 'Fahim Rahman',
            'customer_email' => 'fahim@example.com',
            'customer_phone' => '01711223344',
            'shipping_address' => 'House 12, Road 4, Dhanmondi',
            'city' => 'Inside Dhaka',
            'zone' => 'Dhaka City',
            'payment_method' => Order::METHOD_COD,
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_CONFIRMED,
            'subtotal' => 2400.00,
            'shipping_charge' => 70.00,
            'discount_amount' => 0.00,
            'total_amount' => 2470.00,
            'currency' => 'BDT',
            'confirmed_at' => now(),
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'product_id' => $this->product->id,
            'product_name' => 'Classic Oxford Shirt',
            'product_sku' => 'SHIRT-OXF-001',
            'unit_price' => 2400.00,
            'quantity' => 1,
            'line_total' => 2400.00,
        ]);

        OrderStatusHistory::create([
            'order_id' => $this->order->id,
            'user_id' => null,
            'from_status' => null,
            'to_status' => Order::STATUS_PENDING,
            'action' => 'order_placed',
            'comment' => 'Order placed successfully.',
        ]);

        OrderStatusHistory::create([
            'order_id' => $this->order->id,
            'user_id' => null,
            'from_status' => Order::STATUS_PENDING,
            'to_status' => Order::STATUS_CONFIRMED,
            'action' => 'order_confirmed',
            'comment' => 'Stock verified and confirmed by support.',
        ]);
    }

    public function test_customer_can_render_track_order_page(): void
    {
        $response = $this->get(route('orders.track'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder', null)
        );
    }

    public function test_guest_can_trace_order_status_with_order_number_and_phone(): void
    {
        $response = $this->get(route('orders.track', [
            'order_number' => 'ORD-20261101-1001',
            'phone' => '01711223344',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder.order_number', 'ORD-20261101-1001')
            ->where('trackedOrder.order_status', Order::STATUS_CONFIRMED)
            ->where('trackedOrder.total_amount', 2470)
            ->where('trackedOrder.timeline.is_cancelled', false)
            ->has('trackedOrder.items', 1)
            ->has('trackedOrder.status_histories', 2)
        );
    }

    public function test_guest_can_trace_order_status_with_order_number_and_email(): void
    {
        $response = $this->get(route('orders.track', [
            'order_number' => 'ORD-20261101-1001',
            'phone' => 'fahim@example.com',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder.order_number', 'ORD-20261101-1001')
        );
    }

    public function test_guest_cannot_trace_order_without_phone_or_email_verification(): void
    {
        $response = $this->get(route('orders.track', [
            'order_number' => 'ORD-20261101-1001',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder', null)
            ->whereNot('errorMessage', null)
        );
    }

    public function test_authenticated_customer_can_trace_their_own_order_without_phone(): void
    {
        $response = $this->actingAs($this->customer)->get(route('orders.track', [
            'order_number' => 'ORD-20261101-1001',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder.order_number', 'ORD-20261101-1001')
            ->has('userRecentOrders')
        );
    }

    public function test_authenticated_customer_cannot_view_another_customer_order_without_contact(): void
    {
        $response = $this->actingAs($this->otherCustomer)->get(route('orders.track', [
            'order_number' => 'ORD-20261101-1001',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder', null)
            ->whereNot('errorMessage', null)
        );
    }

    public function test_direct_track_route_redirects_to_track_order(): void
    {
        $response = $this->get(route('orders.track.show', [
            'orderNumber' => 'ORD-20261101-1001',
            'phone' => '01711223344',
        ]));

        $response->assertRedirect(route('orders.track', [
            'order_number' => 'ORD-20261101-1001',
            'phone' => '01711223344',
        ]));
    }

    public function test_non_existent_order_shows_error_message(): void
    {
        $response = $this->get(route('orders.track', [
            'order_number' => 'ORD-NON-EXISTENT',
            'phone' => '01711223344',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/TrackOrder')
            ->where('trackedOrder', null)
            ->whereNot('errorMessage', null)
        );
    }
}
