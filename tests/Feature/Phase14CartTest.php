<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase14CartTest extends TestCase
{
    use RefreshDatabase;

    protected Product $product;
    protected ProductVariant $variant;
    protected User $customerUser;
    protected string $sessionId = 'test-session-cart-123';

    protected function setUp(): void
    {
        parent::setUp();

        $this->product = Product::create([
            'name' => 'Royal Oxford Cotton Shirt',
            'slug' => 'royal-oxford-cotton-shirt',
            'sku' => 'MSH-OXF-001',
            'base_price' => 2000.00,
            'sale_price' => 1800.00,
            'stock_quantity' => 10,
            'low_stock_threshold' => 3,
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'MSH-OXF-001-BLU-L',
            'size' => 'L',
            'color' => 'Royal Blue',
            'price_adjustment' => 100.00,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $this->customerUser = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
            'password' => bcrypt('password123'),
        ]);
    }

    public function test_guest_can_fetch_active_cart(): void
    {
        $response = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->get(route('cart.index'));

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'cart' => [
                'count' => 0,
                'subtotal' => 0,
                'is_free_shipping' => false,
                'free_shipping_threshold' => 3000,
            ],
        ]);
    }

    public function test_guest_can_add_simple_product_to_cart(): void
    {
        $response = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'cart' => [
                'count' => 2,
                'subtotal' => 3600.00, // 1800 * 2
                'is_free_shipping' => true, // 3600 >= 3000
                'amount_for_free_shipping' => 0.00,
            ],
        ]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'product_variant_id' => null,
            'quantity' => 2,
        ]);
    }

    public function test_guest_can_add_variant_product_to_cart(): void
    {
        $response = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 1,
            ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'cart' => [
                'count' => 1,
                'subtotal' => 1900.00, // (1800 + 100) * 1
                'is_free_shipping' => false,
                'amount_for_free_shipping' => 1100.00, // 3000 - 1900
            ],
        ]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 1,
        ]);
    }

    public function test_adding_same_item_increments_quantity(): void
    {
        $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 1,
            ]);

        $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);

        $this->assertEquals(1, CartItem::count());
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 3,
        ]);
    }

    public function test_adding_item_cannot_exceed_available_stock(): void
    {
        // Variant stock is 5
        $response = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 6,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['quantity']);
    }

    public function test_can_update_cart_item_quantity(): void
    {
        $addRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $itemId = $addRes->json('item.id');

        $updateRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->patchJson(route('cart.items.update', $itemId), [
                'quantity' => 3,
            ]);

        $updateRes->assertOk();
        $updateRes->assertJson([
            'success' => true,
            'cart' => [
                'count' => 3,
                'subtotal' => 5400.00,
            ],
        ]);

        $this->assertDatabaseHas('cart_items', [
            'id' => $itemId,
            'quantity' => 3,
        ]);
    }

    public function test_setting_quantity_to_zero_removes_item(): void
    {
        $addRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $itemId = $addRes->json('item.id');

        $updateRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->patchJson(route('cart.items.update', $itemId), [
                'quantity' => 0,
            ]);

        $updateRes->assertOk();
        $this->assertDatabaseMissing('cart_items', ['id' => $itemId]);
    }

    public function test_can_remove_item_from_cart(): void
    {
        $addRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $itemId = $addRes->json('item.id');

        $deleteRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->deleteJson(route('cart.items.destroy', $itemId));
        $deleteRes->assertOk();

        $this->assertDatabaseMissing('cart_items', ['id' => $itemId]);
    }

    public function test_can_clear_cart(): void
    {
        $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $this->assertEquals(1, CartItem::count());

        $clearRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->deleteJson(route('cart.clear'));
        $clearRes->assertOk();

        $this->assertEquals(0, CartItem::count());
    }

    public function test_guest_cart_merges_into_customer_account_on_login(): void
    {
        // 1. Add item as guest with session header
        $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 2,
            ]);

        $guestCart = Cart::where('session_id', $this->sessionId)->whereNull('user_id')->first();
        $this->assertNotNull($guestCart);
        $this->assertEquals(2, $guestCart->items_count);

        // 2. Log in as customer passing the same session header
        $loginRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->post(route('login.store'), [
                'email' => $this->customerUser->email,
                'password' => 'password123',
            ]);

        $loginRes->assertRedirect(route('home'));

        // 3. Verify user's cart now has the 2 items
        $userCart = Cart::where('user_id', $this->customerUser->id)->first();
        $this->assertNotNull($userCart);
        $this->assertEquals(2, $userCart->items_count);
    }
}
