<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase13ProductDetailTest extends TestCase
{
    use RefreshDatabase;

    protected Category $category;
    protected Brand $brand;
    protected Product $product;
    protected Product $inactiveProduct;
    protected ProductVariant $variantM;
    protected ProductVariant $variantL;

    protected function setUp(): void
    {
        parent::setUp();

        Setting::updateOrCreate(
            ['key' => 'site_name'],
            ['value' => 'ORIO STYLE', 'group' => 'general']
        );

        $this->category = Category::create([
            'name' => "Men's Luxury Thobes",
            'slug' => 'mens-luxury-thobes',
            'is_active' => true,
        ]);

        $this->brand = Brand::create([
            'name' => 'ORIO Signature',
            'slug' => 'orio-signature',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'name' => 'Royal Emirati Luxury Thobe',
            'slug' => 'royal-emirati-luxury-thobe',
            'sku' => 'THB-EMR-001',
            'short_description' => 'Fine Japanese spun polyester thobe with hand embroidery.',
            'description' => 'Features delicate matte gold stitching on collar and cuffs.',
            'base_price' => 5500.00,
            'sale_price' => 4950.00,
            'cost_price' => 2400.00,
            'stock_quantity' => 20,
            'low_stock_threshold' => 5,
            'is_active' => true,
            'is_featured' => true,
        ]);

        // Add gallery images
        ProductImage::create([
            'product_id' => $this->product->id,
            'image_path' => 'products/emirati_front.jpg',
            'is_primary' => true,
            'display_order' => 1,
        ]);
        ProductImage::create([
            'product_id' => $this->product->id,
            'image_path' => 'products/emirati_back.jpg',
            'is_primary' => false,
            'display_order' => 2,
        ]);

        // Add variants with color and size
        $this->variantM = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'THB-EMR-001-WHT-M',
            'size' => 'M',
            'color' => 'Crisp White',
            'price_adjustment' => 0.00,
            'stock_quantity' => 12,
            'is_active' => true,
        ]);

        $this->variantL = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'THB-EMR-001-WHT-L',
            'size' => 'L',
            'color' => 'Crisp White',
            'price_adjustment' => 150.00,
            'stock_quantity' => 8,
            'is_active' => true,
        ]);

        // Inactive product
        $this->inactiveProduct = Product::create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'name' => 'Archived Secret Product',
            'slug' => 'archived-secret-product',
            'sku' => 'SEC-001',
            'base_price' => 3000.00,
            'stock_quantity' => 5,
            'is_active' => false,
        ]);
    }

    public function test_product_detail_page_renders_with_inertia(): void
    {
        $response = $this->get(route('products.show', $this->product->slug));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/ProductDetail')
            ->where('product.id', $this->product->id)
            ->where('product.name', 'Royal Emirati Luxury Thobe')
            ->where('product.sku', 'THB-EMR-001')
            ->has('product.images', 2)
            ->has('product.variants', 2)
            ->has('relatedProducts')
            ->has('settings')
        );
    }

    public function test_inactive_or_non_existent_product_returns_404(): void
    {
        // Inactive product
        $inactiveResponse = $this->get(route('products.show', $this->inactiveProduct->slug));
        $inactiveResponse->assertStatus(404);

        // Non-existent product
        $notFoundResponse = $this->get(route('products.show', 'non-existent-slug-12345'));
        $notFoundResponse->assertStatus(404);
    }

    public function test_product_detail_hydrates_variant_attributes_and_pricing(): void
    {
        $response = $this->get(route('products.show', $this->product->slug));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('product.variants.0.sku', 'THB-EMR-001-WHT-M')
            ->where('product.variants.0.size', 'M')
            ->where('product.variants.0.color', 'Crisp White')
            ->where('product.variants.0.stock_quantity', 12)
            ->where('product.variants.1.sku', 'THB-EMR-001-WHT-L')
            ->where('product.variants.1.price_adjustment', 150)
            ->where('product.variants.1.stock_quantity', 8)
        );
    }

    public function test_related_products_excludes_current_product(): void
    {
        // Create another product in the same category
        $related = Product::create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'name' => 'Related Classic Jubbah',
            'slug' => 'related-classic-jubbah',
            'sku' => 'JBH-CLS-002',
            'base_price' => 4000.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $response = $this->get(route('products.show', $this->product->slug));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('relatedProducts', 1)
            ->where('relatedProducts.0.id', $related->id)
            ->where('relatedProducts.0.name', 'Related Classic Jubbah')
        );
    }

    public function test_guest_and_customer_can_access_product_details(): void
    {
        // Guest
        $guestResponse = $this->get(route('products.show', $this->product->slug));
        $guestResponse->assertStatus(200);

        // Customer
        $customer = User::factory()->create(['role' => 'customer']);
        $authResponse = $this->actingAs($customer)->get(route('products.show', $this->product->slug));
        $authResponse->assertStatus(200);
    }
}
