<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Storefront\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class Phase16CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Helper to create an active in-stock product.
     */
    protected function createProduct(array $attributes = []): Product
    {
        $category = Category::create([
            'name' => 'Category ' . Str::random(5),
            'slug' => 'category-' . Str::random(5),
            'is_active' => true,
        ]);

        $price = $attributes['price'] ?? 1200.00;
        unset($attributes['price']);

        return Product::create(array_merge([
            'name' => 'Product ' . Str::random(5),
            'slug' => 'product-' . Str::random(5),
            'sku' => 'SKU-' . strtoupper(Str::random(6)),
            'category_id' => $category->id,
            'is_active' => true,
            'base_price' => $price,
            'sale_price' => null,
            'cost_price' => 700.00,
            'stock_quantity' => 20,
        ], $attributes));
    }

    /**
     * Test that an empty cart redirects back to the shop page with an informational message.
     */
    public function test_empty_cart_cannot_access_checkout_and_redirects_to_shop(): void
    {
        $response = $this->get('/checkout');

        $response->assertRedirect(route('shop.index'));
        $response->assertSessionHas('info');
    }

    /**
     * Test that the single-page checkout view renders successfully when items are present.
     */
    public function test_checkout_screen_renders_with_cart_items_and_shipping_configs(): void
    {
        $product = $this->createProduct(['price' => 1500.00]);

        // Add item to cart
        $sessionToken = 'test-checkout-sess-1';
        $cart = Cart::create(['session_id' => $sessionToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->get('/checkout');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Storefront/Checkout')
            ->has('cart')
            ->has('shippingConfig')
            ->has('paymentConfig')
            ->where('cart.count', 1)
        );
    }

    /**
     * Test that a guest customer can successfully place a COD order.
     */
    public function test_guest_can_place_order_with_cash_on_delivery(): void
    {
        $product = $this->createProduct(['price' => 1000.00, 'stock_quantity' => 15]);

        $sessionToken = 'test-guest-checkout-1';
        $cart = Cart::create(['session_id' => $sessionToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $payload = [
            'customer_name' => 'Fahim Rahman',
            'customer_phone' => '01712345678',
            'customer_email' => 'fahim@example.com',
            'shipping_address' => 'House 42, Road 11, Sector 4, Uttara',
            'delivery_zone' => 'inside_dhaka',
            'city' => 'Dhaka',
            'payment_method' => 'cod',
            'customer_notes' => 'Please call before arrival.',
        ];

        $response = $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', $payload);

        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Fahim Rahman',
            'customer_phone' => '01712345678',
            'payment_method' => 'cod',
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 2000.00,
        ]);

        $order = Order::where('customer_phone', '01712345678')->first();
        $this->assertNotNull($order);
        $this->assertCount(1, $order->items);

        // Assert cart was emptied
        $this->assertEquals(0, $cart->fresh()->items()->count());

        $response->assertRedirect(route('checkout.success', $order->order_number));
    }

    /**
     * Test that an authenticated customer has their order linked to their user account.
     */
    public function test_authenticated_customer_order_is_linked_to_user_id(): void
    {
        $user = User::factory()->customer()->create([
            'name' => 'Registered Customer',
            'email' => 'reg_user@orio.com',
            'phone' => '01899887766',
        ]);

        $product = $this->createProduct(['price' => 800.00]);

        $sessionToken = 'test-auth-checkout-1';
        $cart = Cart::create(['session_id' => $sessionToken, 'user_id' => $user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $payload = [
            'customer_name' => $user->name,
            'customer_phone' => $user->phone,
            'customer_email' => $user->email,
            'shipping_address' => 'Mirpur DOHS, Road 5',
            'delivery_zone' => 'inside_dhaka',
            'payment_method' => 'cod',
        ];

        $response = $this->actingAs($user)
            ->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', $payload);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'customer_phone' => '01899887766',
        ]);
    }

    /**
     * Test delivery charges apply correctly based on Inside Dhaka vs Outside Dhaka.
     */
    public function test_delivery_charges_calculated_correctly_for_inside_and_outside_dhaka(): void
    {
        $product = $this->createProduct(['price' => 500.00]);

        // 1. Outside Dhaka Test
        $sessionToken = 'test-outside-charge';
        $cart = Cart::create(['session_id' => $sessionToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', [
                'customer_name' => 'Chittagong Buyer',
                'customer_phone' => '01611223344',
                'shipping_address' => 'GEC Circle, Chittagong',
                'delivery_zone' => 'outside_dhaka',
                'payment_method' => 'cod',
            ]);

        $outsideOrder = Order::where('customer_phone', '01611223344')->first();
        $this->assertEquals(130.00, (float) $outsideOrder->shipping_charge);
        $this->assertEquals(630.00, (float) $outsideOrder->total_amount);

        // 2. Inside Dhaka Test
        $sessionToken2 = 'test-inside-charge';
        $cart2 = Cart::create(['session_id' => $sessionToken2]);
        CartItem::create([
            'cart_id' => $cart2->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->withSession(['_token' => $sessionToken2])
            ->withCookie('cart_session', $sessionToken2)
            ->withHeader('X-Cart-Session', $sessionToken2)
            ->post('/checkout', [
                'customer_name' => 'Dhanmondi Buyer',
                'customer_phone' => '01699887766',
                'shipping_address' => 'Road 27, Dhanmondi',
                'delivery_zone' => 'inside_dhaka',
                'payment_method' => 'cod',
            ]);

        $insideOrder = Order::where('customer_phone', '01699887766')->first();
        $this->assertEquals(70.00, (float) $insideOrder->shipping_charge);
        $this->assertEquals(570.00, (float) $insideOrder->total_amount);
    }

    /**
     * Test free shipping threshold waives the delivery charge.
     */
    public function test_free_shipping_threshold_waives_delivery_charge(): void
    {
        $product = $this->createProduct(['price' => 2500.00]);

        $sessionToken = 'test-free-shipping';
        $cart = Cart::create(['session_id' => $sessionToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', [
                'customer_name' => 'Free Shipping Recipient',
                'customer_phone' => '01511223344',
                'shipping_address' => 'Sylhet Sadar',
                'delivery_zone' => 'outside_dhaka',
                'payment_method' => 'cod',
            ]);

        $order = Order::where('customer_phone', '01511223344')->first();
        $this->assertEquals(0.00, (float) $order->shipping_charge);
        $this->assertEquals(2500.00, (float) $order->total_amount);
    }

    /**
     * Test that an applied coupon reduces the order total amount and increments coupon usage.
     */
    public function test_coupon_discount_is_applied_to_placed_order(): void
    {
        $coupon = Coupon::create([
            'code' => 'CHECKOUT200',
            'name' => '200 Flat Off',
            'discount_type' => 'fixed',
            'discount_value' => 200.00,
            'min_order_amount' => 1000.00,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(10),
            'times_used' => 0,
        ]);

        $product = $this->createProduct(['price' => 1500.00]);

        $sessionToken = 'test-coupon-order';
        $cart = Cart::create([
            'session_id' => $sessionToken,
            'coupon_code' => 'CHECKOUT200',
        ]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', [
                'customer_name' => 'Coupon User',
                'customer_phone' => '01700112233',
                'shipping_address' => 'Banani, Road 11',
                'delivery_zone' => 'inside_dhaka',
                'payment_method' => 'cod',
            ]);

        $order = Order::where('customer_phone', '01700112233')->first();
        $this->assertEquals(200.00, (float) $order->discount_amount);
        // 1500 - 200 + 70 shipping = 1370
        $this->assertEquals(1370.00, (float) $order->total_amount);

        // Coupon used count incremented
        $this->assertEquals(1, $coupon->fresh()->times_used);
    }

    /**
     * Test product and variant inventory stocks are decremented and movement logged upon order placement.
     */
    public function test_inventory_stock_is_decremented_and_movement_logged(): void
    {
        $product = $this->createProduct(['stock_quantity' => 20]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'PROD-VAR-M-BLK',
            'size' => 'M',
            'color' => 'Black',
            'stock_quantity' => 10,
            'is_active' => true,
            'price_adjustment' => 0.00,
        ]);

        $sessionToken = 'test-stock-decrement';
        $cart = Cart::create(['session_id' => $sessionToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);

        $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', [
                'customer_name' => 'Stock Audit Buyer',
                'customer_phone' => '01999887766',
                'shipping_address' => 'Gulshan 2, Dhaka',
                'delivery_zone' => 'inside_dhaka',
                'payment_method' => 'cod',
            ]);

        // Variant stock dropped from 10 to 7
        $this->assertEquals(7, $variant->fresh()->stock_quantity);

        // Inventory movement logged
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'type' => InventoryMovement::TYPE_ORDER_OUT,
            'quantity' => -3,
        ]);
    }

    /**
     * Test validation errors on missing required fields.
     */
    public function test_validation_errors_prevent_order_placement_on_invalid_inputs(): void
    {
        $product = $this->createProduct();

        $sessionToken = 'test-validation-err';
        $cart = Cart::create(['session_id' => $sessionToken]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->withSession(['_token' => $sessionToken])
            ->withCookie('cart_session', $sessionToken)
            ->withHeader('X-Cart-Session', $sessionToken)
            ->post('/checkout', [
                'customer_name' => '',
                'customer_phone' => '',
                'shipping_address' => '',
                'payment_method' => 'unsupported_method',
            ]);

        $response->assertSessionHasErrors(['customer_name', 'customer_phone', 'shipping_address', 'payment_method']);
    }

    /**
     * Test order success confirmation screen renders with order items and totals.
     */
    public function test_order_success_page_renders_with_order_summary(): void
    {
        $product = $this->createProduct(['price' => 1200.00]);

        $order = Order::create([
            'order_number' => 'ORD-TEST-99881',
            'customer_name' => 'Nusrat Jahan',
            'customer_phone' => '01755443322',
            'shipping_address' => 'Bashundhara R/A, Block C',
            'city' => 'Inside Dhaka',
            'payment_method' => 'cod',
            'payment_status' => Order::PAYMENT_UNPAID,
            'order_status' => Order::STATUS_PENDING,
            'subtotal' => 1200.00,
            'shipping_charge' => 70.00,
            'total_amount' => 1270.00,
            'currency' => 'BDT',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 1200.00,
            'quantity' => 1,
            'line_total' => 1200.00,
        ]);

        $response = $this->get(route('checkout.success', $order->order_number));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Storefront/OrderSuccess')
            ->where('order.order_number', 'ORD-TEST-99881')
            ->where('order.customer_name', 'Nusrat Jahan')
            ->has('order.items', 1)
        );
    }
}
