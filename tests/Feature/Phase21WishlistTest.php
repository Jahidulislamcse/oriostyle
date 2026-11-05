<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductBundle;
use App\Models\StockNotification;
use App\Models\User;
use App\Models\Wishlist;
use App\Services\Storefront\WishlistService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase21WishlistTest extends TestCase
{
    use RefreshDatabase;

    protected function createSampleProduct(string $name = 'Sample Product', string $sku = 'SAMPLE-001', float $price = 1200.00): Product
    {
        $category = Category::firstOrCreate(
            ['slug' => 'apparel'],
            ['name' => 'Apparel', 'is_active' => true]
        );

        $brand = Brand::firstOrCreate(
            ['slug' => 'orio-style'],
            ['name' => 'ORIO STYLE', 'is_active' => true]
        );

        return Product::create([
            'name' => $name,
            'slug' => strtolower(str_replace(' ', '-', $name)) . '-' . uniqid(),
            'sku' => $sku,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => $price,
            'stock_quantity' => 25,
            'is_active' => true,
        ]);
    }

    public function test_guest_can_toggle_product_in_wishlist_and_view_wishlist_page(): void
    {
        $product = $this->createSampleProduct('Luxury Panjabi', 'PANJABI-001', 3500.00);

        // Toggle in
        $response = $this->withHeaders(['X-Cart-Session' => 'guest-session-123'])
            ->postJson('/wishlist/toggle', [
                'product_id' => $product->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'is_wishlisted' => true,
            'count' => 1,
        ]);

        $this->assertDatabaseHas('wishlists', [
            'session_id' => 'guest-session-123',
            'product_id' => $product->id,
            'user_id' => null,
        ]);

        // View Wishlist page
        $pageResponse = $this->withHeaders(['X-Cart-Session' => 'guest-session-123'])
            ->get('/wishlist');

        $pageResponse->assertStatus(200);
        $pageResponse->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Wishlist')
            ->has('wishlistItems', 1)
            ->where('wishlistItems.0.product_id', $product->id)
        );

        // Toggle out
        $toggleOut = $this->withHeaders(['X-Cart-Session' => 'guest-session-123'])
            ->postJson('/wishlist/toggle', [
                'product_id' => $product->id,
            ]);

        $toggleOut->assertStatus(200);
        $toggleOut->assertJson([
            'success' => true,
            'is_wishlisted' => false,
            'count' => 0,
        ]);

        $this->assertDatabaseMissing('wishlists', [
            'session_id' => 'guest-session-123',
            'product_id' => $product->id,
        ]);
    }

    public function test_authenticated_customer_can_toggle_product_in_wishlist(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $product = $this->createSampleProduct('Suede Visor Cap', 'CAP-001', 550.00);

        $response = $this->actingAs($user)
            ->postJson('/wishlist/toggle', [
                'product_id' => $product->id,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'is_wishlisted' => true,
            'count' => 1,
        ]);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_guest_wishlist_merges_into_customer_account_upon_login(): void
    {
        $product1 = $this->createSampleProduct('Product A', 'PROD-A', 1000.00);
        $product2 = $this->createSampleProduct('Product B', 'PROD-B', 1500.00);

        $sessionId = 'guest-merge-session-999';

        // Guest adds product 1 & 2
        Wishlist::create(['session_id' => $sessionId, 'product_id' => $product1->id]);
        Wishlist::create(['session_id' => $sessionId, 'product_id' => $product2->id]);

        $user = User::factory()->create([
            'email' => 'customer@orio.test',
            'password' => bcrypt('secret123'),
        ]);

        // User already had product 1 in their account
        Wishlist::create(['user_id' => $user->id, 'product_id' => $product1->id]);

        $service = app(WishlistService::class);
        $service->mergeGuestWishlistIntoUser($sessionId, $user);

        // Product 1 and 2 should now both belong to $user with no duplicates
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product1->id,
        ]);
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product2->id,
        ]);

        $this->assertEquals(2, Wishlist::where('user_id', $user->id)->count());
        $this->assertEquals(0, Wishlist::where('session_id', $sessionId)->count());
    }

    public function test_customer_can_add_entire_outfit_bundle_to_cart(): void
    {
        $mainProduct = $this->createSampleProduct('Main Panjabi', 'PANJ-M', 3200.00);
        $pairedProduct = $this->createSampleProduct('White Pajama', 'PAJ-W', 1100.00);

        ProductBundle::create([
            'main_product_id' => $mainProduct->id,
            'paired_product_id' => $pairedProduct->id,
            'discount_percentage' => 5.00,
            'badge_label' => 'Matching Pajama',
            'is_active' => true,
        ]);

        $response = $this->withHeaders(['X-Cart-Session' => 'bundle-cart-session'])
            ->post('/bundles/add-to-cart', [
                'items' => [
                    ['product_id' => $mainProduct->id, 'quantity' => 1],
                    ['product_id' => $pairedProduct->id, 'quantity' => 1],
                ],
            ]);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $mainProduct->id,
            'quantity' => 1,
        ]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $pairedProduct->id,
            'quantity' => 1,
        ]);
    }

    public function test_customer_can_register_for_out_of_stock_notifications(): void
    {
        $product = $this->createSampleProduct('Sold Out Thobe', 'THOBE-SO', 2800.00);
        $product->update(['stock_quantity' => 0]);

        $response = $this->postJson('/stock-notifications', [
            'product_id' => $product->id,
            'email' => 'shopper@example.com',
            'phone' => '+8801700112233',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('stock_notifications', [
            'product_id' => $product->id,
            'email' => 'shopper@example.com',
            'phone' => '+8801700112233',
            'is_notified' => false,
        ]);
    }
}
