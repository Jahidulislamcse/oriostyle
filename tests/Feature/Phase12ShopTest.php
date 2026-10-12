<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase12ShopTest extends TestCase
{
    use RefreshDatabase;

    protected Category $parentCat;
    protected Category $childCat;
    protected Brand $brandA;
    protected Brand $brandB;
    protected Product $prod1;
    protected Product $prod2;
    protected Product $prod3;
    protected Product $outOfStockProd;

    protected function setUp(): void
    {
        parent::setUp();

        Setting::updateOrCreate(
            ['key' => 'site_name'],
            ['value' => 'ORIO STYLE', 'group' => 'general']
        );
        Setting::updateOrCreate(
            ['key' => 'currency_symbol'],
            ['value' => '৳', 'group' => 'general']
        );

        // Setup Categories hierarchy
        $this->parentCat = Category::create([
            'name' => "Men's Luxury",
            'slug' => 'mens-luxury',
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
        ]);

        $this->childCat = Category::create([
            'parent_id' => $this->parentCat->id,
            'name' => 'Royal Thobes',
            'slug' => 'royal-thobes',
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
        ]);

        // Setup Brands
        $this->brandA = Brand::create([
            'name' => 'ORIO Signature',
            'slug' => 'orio-signature',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $this->brandB = Brand::create([
            'name' => 'Artisan Tailors',
            'slug' => 'artisan-tailors',
            'is_active' => true,
            'is_featured' => false,
        ]);

        // Setup Products
        $this->prod1 = Product::create([
            'category_id' => $this->childCat->id,
            'brand_id' => $this->brandA->id,
            'name' => 'Royal Silk Thobe',
            'slug' => 'royal-silk-thobe',
            'sku' => 'THB-SLK-001',
            'base_price' => 5000,
            'sale_price' => 4500, // Effective 4500
            'stock_quantity' => 10,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $this->prod2 = Product::create([
            'category_id' => $this->parentCat->id,
            'brand_id' => $this->brandB->id,
            'name' => 'Artisan Cotton Kurta',
            'slug' => 'artisan-cotton-kurta',
            'sku' => 'KRT-CTN-002',
            'base_price' => 2000,
            'sale_price' => null, // Effective 2000
            'stock_quantity' => 15,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $this->prod3 = Product::create([
            'category_id' => $this->childCat->id,
            'brand_id' => $this->brandA->id,
            'name' => 'Gold Embroidered Jubbah',
            'slug' => 'gold-embroidered-jubbah',
            'sku' => 'JBH-GLD-003',
            'base_price' => 8000,
            'sale_price' => 7000, // Effective 7000
            'stock_quantity' => 5,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $this->outOfStockProd = Product::create([
            'category_id' => $this->childCat->id,
            'brand_id' => $this->brandB->id,
            'name' => 'Out of Stock Vintage Cap',
            'slug' => 'out-of-stock-vintage-cap',
            'sku' => 'CAP-VNT-004',
            'base_price' => 1200,
            'sale_price' => null,
            'stock_quantity' => 0,
            'is_active' => true,
            'is_featured' => false,
        ]);
    }

    public function test_shop_index_renders_with_inertia_and_facets(): void
    {
        $response = $this->get(route('shop.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 4)
            ->has('categoriesTree')
            ->has('brands')
            ->has('priceRange')
            ->has('filters')
        );
    }

    public function test_shop_filters_by_category_and_includes_descendant_products(): void
    {
        // Filtering by parent category 'mens-luxury' should include both parent and child 'royal-thobes' products
        $response = $this->get(route('shop.index', ['category' => 'mens-luxury']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 4)
            ->where('filters.category', 'mens-luxury')
        );

        // Filtering specifically by child category
        $childResponse = $this->get(route('shop.index', ['category' => 'royal-thobes']));
        $childResponse->assertStatus(200);
        $childResponse->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 3) // prod1, prod3, outOfStockProd
        );
    }

    public function test_shop_filters_by_brand(): void
    {
        $response = $this->get(route('shop.index', ['brand' => 'orio-signature']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 2) // prod1 and prod3
            ->where('products.data.0.brand_id', $this->brandA->id)
            ->where('products.data.1.brand_id', $this->brandA->id)
        );
    }

    public function test_shop_filters_by_price_range(): void
    {
        // Products with effective price between 3000 and 6000 (prod1: 4500)
        $response = $this->get(route('shop.index', [
            'min_price' => 3000,
            'max_price' => 6000,
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'royal-silk-thobe')
        );
    }

    public function test_shop_filters_by_in_stock_only(): void
    {
        $response = $this->get(route('shop.index', ['in_stock' => '1']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 3) // Excludes outOfStockProd
        );
    }

    public function test_shop_filters_by_keyword_search(): void
    {
        $response = $this->get(route('shop.index', ['search' => 'Cotton']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'artisan-cotton-kurta')
        );
    }

    public function test_shop_sorts_products_by_effective_price(): void
    {
        // Price Low to High: outOfStockProd(1200) -> prod2(2000) -> prod1(4500) -> prod3(7000)
        $ascResponse = $this->get(route('shop.index', ['sort' => 'price_asc']));
        $ascResponse->assertStatus(200);
        $ascResponse->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.slug', 'out-of-stock-vintage-cap')
            ->where('products.data.1.slug', 'artisan-cotton-kurta')
        );

        // Price High to Low: prod3(7000) -> prod1(4500) -> prod2(2000) -> outOfStockProd(1200)
        $descResponse = $this->get(route('shop.index', ['sort' => 'price_desc']));
        $descResponse->assertStatus(200);
        $descResponse->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.slug', 'gold-embroidered-jubbah')
            ->where('products.data.1.slug', 'royal-silk-thobe')
        );
    }

    public function test_live_search_api_returns_json_suggestions(): void
    {
        $response = $this->getJson(route('shop.search', ['q' => 'Thobe']));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'products' => [
                '*' => ['id', 'name', 'slug', 'sku', 'effective_price', 'image_url', 'category_name'],
            ],
            'categories',
        ]);
        $response->assertJsonFragment([
            'name' => 'Royal Silk Thobe',
            'slug' => 'royal-silk-thobe',
        ]);
    }

    public function test_live_search_api_returns_empty_when_query_is_too_short(): void
    {
        $response = $this->getJson(route('shop.search', ['q' => 'a']));

        $response->assertStatus(200);
        $response->assertExactJson([
            'products' => [],
            'categories' => [],
        ]);
    }

    public function test_guest_and_customer_can_access_shop(): void
    {
        // Guest
        $guestResponse = $this->get(route('shop.index'));
        $guestResponse->assertStatus(200);

        // Customer
        $customer = User::factory()->create(['role' => 'customer']);
        $authResponse = $this->actingAs($customer)->get(route('shop.index'));
        $authResponse->assertStatus(200);
    }
}
