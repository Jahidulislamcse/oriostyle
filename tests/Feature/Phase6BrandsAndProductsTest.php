<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase6BrandsAndProductsTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'email' => 'admin@orio.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->customerUser = User::factory()->create([
            'email' => 'customer@orio.com',
            'role' => 'customer',
            'is_active' => true,
        ]);
    }

    public function test_brands_index_renders_for_admin_with_metrics(): void
    {
        Brand::create([
            'name' => 'Nike',
            'slug' => 'nike',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.brands.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Brands/Index')
                ->has('brands', 1)
                ->where('stats.total', 1)
                ->where('stats.active_count', 1)
                ->where('stats.featured_count', 1)
        );
    }

    public function test_admin_can_create_brand_with_logo(): void
    {
        Storage::fake('public');

        $logo = UploadedFile::fake()->image('brand_logo.png', 200, 200);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.brands.store'), [
                'name' => 'Rolex Luxury',
                'website_url' => 'https://rolex.com',
                'description' => 'Swiss luxury watchmaker',
                'display_order' => 1,
                'is_active' => true,
                'is_featured' => true,
                'logo' => $logo,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('brands', [
            'name' => 'Rolex Luxury',
            'slug' => 'rolex-luxury',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $brand = Brand::where('slug', 'rolex-luxury')->firstOrFail();
        $this->assertNotNull($brand->logo);
        $relativePath = \Illuminate\Support\Str::after($brand->logo, '/storage/');
        Storage::disk('public')->assertExists($relativePath);
    }

    public function test_admin_can_update_and_toggle_brand_status(): void
    {
        $brand = Brand::create([
            'name' => 'Adidas',
            'slug' => 'adidas',
            'is_active' => true,
            'is_featured' => false,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.brands.update', $brand->id), [
                'name' => 'Adidas Originals',
                'slug' => 'adidas-originals',
                'is_active' => true,
                'is_featured' => true,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'name' => 'Adidas Originals',
            'slug' => 'adidas-originals',
            'is_featured' => true,
        ]);

        // Toggle active
        $this->actingAs($this->adminUser)
            ->patch(route('admin.brands.toggle-active', $brand->id));

        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_update_brand_and_remove_logo(): void
    {
        Storage::fake('public');

        $brand = Brand::create([
            'name' => 'Nike Sports',
            'slug' => 'nike-sports',
            'logo' => '/storage/brands/fake_nike.png',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.brands.update', $brand->id), [
                'name' => 'Nike Pro',
                'slug' => 'nike-pro',
                'remove_logo' => true,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('brands', [
            'id' => $brand->id,
            'name' => 'Nike Pro',
            'slug' => 'nike-pro',
            'logo' => null,
        ]);
    }

    public function test_admin_can_delete_brand(): void
    {
        $brand = Brand::create([
            'name' => 'Puma',
            'slug' => 'puma',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.brands.destroy', $brand->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('brands', [
            'id' => $brand->id,
        ]);
    }

    public function test_admin_can_delete_brand_via_destroy_endpoint_with_id_payload(): void
    {
        $brand = Brand::create([
            'name' => 'Reebok',
            'slug' => 'reebok',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->delete('/admin/brands/destroy', [
                'id' => $brand->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('brands', [
            'id' => $brand->id,
        ]);
    }

    public function test_products_index_renders_with_metrics_and_filters(): void
    {
        $category = Category::create(['name' => 'Watches', 'slug' => 'watches']);
        $brand = Brand::create(['name' => 'Omega', 'slug' => 'omega']);

        Product::create([
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => 'Omega Speedmaster',
            'slug' => 'omega-speedmaster',
            'sku' => 'OMEGA-001',
            'base_price' => 5000.00,
            'stock_quantity' => 2,
            'low_stock_threshold' => 5,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.products.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Products/Index')
                ->has('products.data', 1)
                ->where('stats.total', 1)
                ->where('stats.low_stock_count', 1)
        );
    }

    public function test_admin_can_store_product_with_variants(): void
    {
        $category = Category::create(['name' => 'Apparel', 'slug' => 'apparel']);
        $brand = Brand::create(['name' => 'Nike', 'slug' => 'nike']);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.products.store'), [
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'name' => 'Nike Air Hoodie',
                'base_price' => 89.99,
                'sale_price' => 74.99,
                'stock_quantity' => 50,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => true,
                'variants' => [
                    ['size' => 'M', 'color' => 'Black', 'price_adjustment' => 0, 'stock_quantity' => 30],
                    ['size' => 'L', 'color' => 'Black', 'price_adjustment' => 5.00, 'stock_quantity' => 20],
                ],
            ]);

        $response->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'name' => 'Nike Air Hoodie',
            'slug' => 'nike-air-hoodie',
            'base_price' => 89.99,
            'sale_price' => 74.99,
            'stock_quantity' => 50,
        ]);

        $product = Product::where('slug', 'nike-air-hoodie')->firstOrFail();
        $this->assertCount(2, $product->variants);
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Black',
            'price_adjustment' => 5.00,
        ]);
    }

    public function test_admin_can_quick_update_product_stock(): void
    {
        $product = Product::create([
            'name' => 'Test Item',
            'slug' => 'test-item',
            'sku' => 'TEST-001',
            'base_price' => 20.00,
            'stock_quantity' => 1,
            'low_stock_threshold' => 5,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.products.update-stock', $product->id), [
                'stock_quantity' => 25,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock_quantity' => 25,
        ]);
    }

    public function test_dashboard_reflects_real_low_stock_and_catalog_metrics(): void
    {
        Product::create([
            'name' => 'Out Stock Item',
            'slug' => 'out-stock-item',
            'sku' => 'OUT-001',
            'base_price' => 10.00,
            'stock_quantity' => 2,
            'low_stock_threshold' => 5,
        ]);

        Brand::create(['name' => 'Gucci', 'slug' => 'gucci']);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Dashboard')
                ->where('metrics.totalProducts', 1)
                ->where('metrics.totalBrands', 1)
                ->where('metrics.lowStockItems', 1)
        );
    }

    public function test_admin_can_render_edit_product_page(): void
    {
        $category = Category::create(['name' => 'Jewelry', 'slug' => 'jewelry']);
        $brand = Brand::create(['name' => 'Cartier', 'slug' => 'cartier']);

        $product = Product::create([
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => 'Cartier Ring',
            'slug' => 'cartier-ring',
            'sku' => 'RING-001',
            'base_price' => 1500.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.products.edit', $product->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Products/Form')
                ->where('product.id', $product->id)
                ->where('product.name', 'Cartier Ring')
        );
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::create([
            'name' => 'Original Watch',
            'slug' => 'original-watch',
            'sku' => 'WATCH-001',
            'base_price' => 100.00,
            'stock_quantity' => 5,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.products.update', $product->id), [
                'name' => 'Updated Luxury Watch',
                'slug' => 'updated-luxury-watch',
                'sku' => 'WATCH-001',
                'base_price' => 250.00,
                'stock_quantity' => 15,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('admin.products.index'));

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Luxury Watch',
            'base_price' => 250.00,
            'stock_quantity' => 15,
        ]);
    }

    public function test_non_admin_cannot_access_brands_or_products(): void
    {
        $this->actingAs($this->customerUser)
            ->get(route('admin.brands.index'))
            ->assertStatus(403);

        $this->actingAs($this->customerUser)
            ->get(route('admin.products.index'))
            ->assertStatus(403);
    }

    public function test_filtering_by_parent_category_includes_products_from_all_descendant_subcategories(): void
    {
        $parentCategory = Category::create([
            'name' => "Men's Fashion",
            'slug' => 'mens-fashion',
            'is_active' => true,
        ]);

        $subCategory1 = Category::create([
            'name' => 'Formal Shirts',
            'slug' => 'formal-shirts',
            'parent_id' => $parentCategory->id,
            'is_active' => true,
        ]);

        $subCategory2 = Category::create([
            'name' => 'Denim Pants',
            'slug' => 'denim-pants',
            'parent_id' => $parentCategory->id,
            'is_active' => true,
        ]);

        $unrelatedCategory = Category::create([
            'name' => "Women's Sarees",
            'slug' => 'womens-sarees',
            'is_active' => true,
        ]);

        // Product in parent directly
        $prodParent = Product::create([
            'category_id' => $parentCategory->id,
            'name' => 'Men Signature Tee',
            'slug' => 'men-signature-tee',
            'sku' => 'M-001',
            'base_price' => 1200.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        // Product in subcategory 1
        $prodSub1 = Product::create([
            'category_id' => $subCategory1->id,
            'name' => 'Royal Oxford Shirt',
            'slug' => 'royal-oxford-shirt',
            'sku' => 'M-002',
            'base_price' => 2200.00,
            'stock_quantity' => 15,
            'is_active' => true,
        ]);

        // Product in subcategory 2
        $prodSub2 = Product::create([
            'category_id' => $subCategory2->id,
            'name' => 'Selvedge Denim',
            'slug' => 'selvedge-denim',
            'sku' => 'M-003',
            'base_price' => 3200.00,
            'stock_quantity' => 20,
            'is_active' => true,
        ]);

        // Unrelated product
        $prodOther = Product::create([
            'category_id' => $unrelatedCategory->id,
            'name' => 'Jamdani Saree',
            'slug' => 'jamdani-saree',
            'sku' => 'W-001',
            'base_price' => 15000.00,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        // Filter by parent category ID
        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.products.index', ['category' => $parentCategory->id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Products/Index')
                ->has('products.data', 3)
                ->where('products.data.0.id', fn ($id) => in_array($id, [$prodParent->id, $prodSub1->id, $prodSub2->id]))
                ->where('products.data.1.id', fn ($id) => in_array($id, [$prodParent->id, $prodSub1->id, $prodSub2->id]))
                ->where('products.data.2.id', fn ($id) => in_array($id, [$prodParent->id, $prodSub1->id, $prodSub2->id]))
                ->has('categories', 4)
                ->where('categories.0.name', "Men's Fashion")
                ->where('categories.0.depth', 0)
        );
    }

    public function test_admin_can_set_offer_product_from_product_index_with_discounted_price(): void
    {
        $product = Product::create([
            'name' => 'Royal Signature Blazer',
            'slug' => 'royal-signature-blazer',
            'sku' => 'BLZ-OFFER-1',
            'base_price' => 5000.00,
            'sale_price' => null,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.products.set-offer', $product->id), [
                'discounted_price' => 3800.00,
                'badge_text' => 'FLASH SALE',
                'coupon_code' => 'ROYAL24',
                'activate_popup' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $product->refresh();
        $this->assertEquals(3800.00, (float) $product->sale_price);

        $settingService = app(\App\Services\Settings\SettingService::class);
        $this->assertEquals($product->id, (int) $settingService->get('popup_product_id'));
        $this->assertTrue(filter_var($settingService->get('popup_enabled'), FILTER_VALIDATE_BOOLEAN));
        $this->assertEquals('FLASH SALE', $settingService->get('popup_badge_text'));
        $this->assertEquals('ROYAL24', $settingService->get('popup_coupon_code'));

        // Admin Products index should share currentOfferProductId
        $indexResponse = $this->actingAs($this->adminUser)
            ->get(route('admin.products.index'));

        $indexResponse->assertOk();
        $indexResponse->assertInertia(fn ($page) =>
            $page->component('Admin/Products/Index')
                ->where('currentOfferProductId', $product->id)
                ->where('popupEnabled', true)
        );
    }

    public function test_admin_can_set_offer_via_standalone_post_endpoint(): void
    {
        $product = Product::create([
            'name' => 'Italian Silk Kurta',
            'slug' => 'italian-silk-kurta',
            'sku' => 'KURTA-001',
            'base_price' => 4500.00,
            'sale_price' => null,
            'stock_quantity' => 12,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post('/admin/products/set-offer', [
                'product_id' => $product->id,
                'discounted_price' => 3200.00,
                'badge_text' => 'SPECIAL',
                'coupon_code' => 'KURTA20',
                'activate_popup' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $product->refresh();
        $this->assertEquals(3200.00, (float) $product->sale_price);

        $settingService = app(\App\Services\Settings\SettingService::class);
        $this->assertEquals($product->id, (int) $settingService->get('popup_product_id'));
    }
}
