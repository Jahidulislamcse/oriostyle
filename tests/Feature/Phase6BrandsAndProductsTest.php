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

    public function test_non_admin_cannot_access_brands_or_products(): void
    {
        $this->actingAs($this->customerUser)
            ->get(route('admin.brands.index'))
            ->assertStatus(403);

        $this->actingAs($this->customerUser)
            ->get(route('admin.products.index'))
            ->assertStatus(403);
    }
}
