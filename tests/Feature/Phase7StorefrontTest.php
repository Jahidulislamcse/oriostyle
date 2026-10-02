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
}
