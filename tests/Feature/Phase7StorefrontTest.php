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
}
