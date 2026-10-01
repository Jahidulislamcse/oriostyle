<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerStorefrontCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected Category $category;
    protected Brand $brand;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::create([
            'name' => 'Luxury Luxury Category',
            'slug' => 'luxury-category',
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
        ]);

        $this->brand = Brand::create([
            'name' => 'Royal Brand',
            'slug' => 'royal-brand',
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
        ]);

        $this->product = Product::create([
            'name' => 'Satin Gold Watch',
            'slug' => 'satin-gold-watch',
            'sku' => 'SKU-GOLD-001',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'base_price' => 500.00,
            'sale_price' => 450.00,
            'stock_quantity' => 20,
            'is_active' => true,
            'is_featured' => true,
            'is_new_arrival' => true,
        ]);
    }

    public function test_homepage_renders_with_storefront_datasets(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('categoriesTree')
            ->has('featuredBrands')
            ->has('featuredProducts')
            ->has('newArrivals')
        );
    }

    public function test_shop_catalog_renders_with_paginated_products_and_filters(): void
    {
        $response = $this->get(route('shop'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Shop/Index')
            ->has('products.data')
            ->has('categories')
            ->has('brands')
            ->has('filters')
        );
    }

    public function test_shop_catalog_filters_by_search_category_and_brand(): void
    {
        $response = $this->get(route('shop', [
            'search' => 'Satin',
            'category' => $this->category->slug,
            'brand' => $this->brand->slug,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Shop/Index')
            ->where('filters.search', 'Satin')
            ->where('filters.category', $this->category->slug)
            ->where('filters.brand', $this->brand->slug)
            ->has('products.data', 1)
        );
    }

    public function test_category_shortcut_redirects_to_shop_with_category_slug(): void
    {
        $response = $this->get(route('category.show', ['category' => $this->category->slug]));

        $response->assertRedirect(route('shop', ['category' => $this->category->slug]));
    }

    public function test_brand_shortcut_redirects_to_shop_with_brand_slug(): void
    {
        $response = $this->get(route('brand.show', ['brand' => $this->brand->slug]));

        $response->assertRedirect(route('shop', ['brand' => $this->brand->slug]));
    }

    public function test_product_detail_page_renders_active_product(): void
    {
        $response = $this->get(route('product.show', ['product' => $this->product->slug]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Shop/Show')
            ->where('product.id', $this->product->id)
            ->where('product.slug', $this->product->slug)
            ->has('relatedProducts')
        );
    }

    public function test_inactive_product_returns_404_on_storefront(): void
    {
        $inactiveProduct = Product::create([
            'name' => 'Hidden Product',
            'slug' => 'hidden-product',
            'sku' => 'SKU-HIDDEN-001',
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'base_price' => 100.00,
            'stock_quantity' => 5,
            'is_active' => false,
        ]);

        $response = $this->get(route('product.show', ['product' => $inactiveProduct->slug]));

        $response->assertNotFound();
    }
}
