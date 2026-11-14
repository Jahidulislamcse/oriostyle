<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase7StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_homepage_renders_successfully_via_react_inertia(): void
    {
        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $brand = Brand::create([
            'name' => 'Orio Brand',
            'slug' => 'orio-brand',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $product = Product::create([
            'name' => 'Premium Shirt',
            'slug' => 'premium-shirt',
            'sku' => 'SHIRT-001',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 1500.00,
            'stock_quantity' => 20,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Index')
            ->has('navCategories')
            ->has('featuredCategories')
            ->has('featuredProducts')
            ->has('newArrivals')
            ->has('brands')
            ->has('settings')
        );
    }

    public function test_storefront_homepage_renders_category_with_multi_images(): void
    {
        $category = Category::create([
            'name' => 'Footwear',
            'slug' => 'footwear',
            'is_active' => true,
            'is_featured' => true,
        ]);

        \App\Models\CategoryImage::create([
            'category_id' => $category->id,
            'image_path' => 'categories/boot1.jpg',
            'is_featured' => true,
            'display_order' => 0,
        ]);

        \App\Models\CategoryImage::create([
            'category_id' => $category->id,
            'image_path' => 'categories/boot2.jpg',
            'is_featured' => false,
            'display_order' => 1,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Index')
            ->where('featuredCategories.0.name', 'Footwear')
            ->has('featuredCategories.0.images', 2)
            ->where('featuredCategories.0.images.0.is_featured', true)
        );
    }

    public function test_storefront_homepage_prioritizes_featured_subcategories_with_dynamic_discount(): void
    {
        $parentCategory = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $subCategory = Category::create([
            'name' => 'Formal Shirts',
            'slug' => 'formal-shirts',
            'parent_id' => $parentCategory->id,
            'discount' => '35% OFF',
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Index')
            ->where('featuredCategories.0.id', $subCategory->id)
            ->where('featuredCategories.0.name', 'Formal Shirts')
            ->where('featuredCategories.0.discount', '35% OFF')
            ->where('featuredCategories.0.parent.name', 'Fashion')
        );
    }

    public function test_storefront_homepage_prioritizes_is_new_arrival_products(): void
    {
        $category = Category::create([
            'name' => 'Fashion',
            'slug' => 'fashion',
            'is_active' => true,
        ]);

        $brand = Brand::create([
            'name' => 'Orio Brand',
            'slug' => 'orio-brand',
            'is_active' => true,
        ]);

        // Product marked as new arrival
        $newArrival = Product::create([
            'name' => 'Flagship Blazer',
            'slug' => 'flagship-blazer',
            'sku' => 'BLAZER-001',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 3500.00,
            'stock_quantity' => 10,
            'is_active' => true,
            'is_new_arrival' => true,
        ]);

        // Product not marked as new arrival
        $regularProduct = Product::create([
            'name' => 'Basic Tee',
            'slug' => 'basic-tee',
            'sku' => 'TEE-001',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 500.00,
            'stock_quantity' => 50,
            'is_active' => true,
            'is_new_arrival' => false,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Index')
            ->has('newArrivals', 1)
            ->where('newArrivals.0.id', $newArrival->id)
            ->where('newArrivals.0.name', 'Flagship Blazer')
        );
    }

    public function test_storefront_homepage_renders_dynamic_category_showcases(): void
    {
        $category = Category::create([
            'name' => 'Formal Suits',
            'slug' => 'formal-suits',
            'banner' => 'categories/banners/suits-panoramic.jpg',
            'is_active' => true,
            'display_order' => 1,
        ]);

        $brand = Brand::create([
            'name' => 'Orio Bespoke',
            'slug' => 'orio-bespoke',
            'is_active' => true,
        ]);

        $product = Product::create([
            'name' => 'Navy Wool Suit',
            'slug' => 'navy-wool-suit',
            'sku' => 'SUIT-001',
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'base_price' => 12000.00,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Index')
            ->has('categoryShowcases', 1)
            ->where('categoryShowcases.0.id', $category->id)
            ->where('categoryShowcases.0.name', 'Formal Suits')
            ->where('categoryShowcases.0.slug', 'formal-suits')
            ->has('categoryShowcases.0.products', 1)
        );
    }

    public function test_shop_with_non_existent_category_returns_zero_products(): void
    {
        $category = Category::create([
            'name' => 'Men Fashion',
            'slug' => 'mens-fashion',
            'is_active' => true,
        ]);

        $product = Product::create([
            'name' => 'Real Product',
            'slug' => 'real-product',
            'sku' => 'REAL-001',
            'category_id' => $category->id,
            'base_price' => 1000.00,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        // Request non-existent category
        $response = $this->get('/shop?category=non-existent-slug');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->has('products.data', 0)
        );
    }
}
