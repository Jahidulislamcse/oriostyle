<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\Storefront\StorefrontService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function __construct(
        protected StorefrontService $storefrontService
    ) {}

    /**
     * Display storefront catalog showcase page with filters.
     */
    public function shop(Request $request): Response
    {
        $search = $request->query('search');
        $categorySlug = $request->query('category');
        $brandSlug = $request->query('brand');
        $minPrice = $request->query('min_price') ? (float) $request->query('min_price') : null;
        $maxPrice = $request->query('max_price') ? (float) $request->query('max_price') : null;
        $sort = $request->query('sort', 'newest');
        $inStockOnly = $request->boolean('in_stock');
        $onSaleOnly = $request->boolean('on_sale');

        $products = $this->storefrontService->getFilteredShopProducts(
            $search,
            $categorySlug,
            $brandSlug,
            $minPrice,
            $maxPrice,
            $sort,
            $inStockOnly,
            $onSaleOnly,
            12
        );

        $categories = Category::query()->active()->rootOnly()->with('children')->orderBy('name')->get();
        $brands = Brand::query()->active()->orderBy('name')->get(['id', 'name', 'slug', 'logo']);

        $selectedCategory = $categorySlug ? Category::where('slug', $categorySlug)->first() : null;
        $selectedBrand = $brandSlug ? Brand::where('slug', $brandSlug)->first() : null;

        return Inertia::render('Shop/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'selectedCategory' => $selectedCategory,
            'selectedBrand' => $selectedBrand,
            'filters' => [
                'search' => $search ?? '',
                'category' => $categorySlug ?? '',
                'brand' => $brandSlug ?? '',
                'min_price' => $minPrice ?? '',
                'max_price' => $maxPrice ?? '',
                'sort' => $sort,
                'in_stock' => $inStockOnly,
                'on_sale' => $onSaleOnly,
            ],
        ]);
    }

    /**
     * Filter by Category.
     */
    public function category(Category $category): \Illuminate\Http\RedirectResponse
    {
        return redirect()->route('shop', ['category' => $category->slug]);
    }

    /**
     * Filter by Brand.
     */
    public function brand(Brand $brand): \Illuminate\Http\RedirectResponse
    {
        return redirect()->route('shop', ['brand' => $brand->slug]);
    }

    /**
     * Display Product Detail Page (PDP).
     */
    public function product(Product $product): Response
    {
        if (!$product->is_active) {
            abort(404, 'Product not found or inactive.');
        }

        $product->load([
            'category:id,name,slug,parent_id',
            'brand:id,name,slug,logo',
            'images',
            'primaryImage',
            'variants' => fn ($q) => $q->where('is_active', true),
        ]);

        // Related products in same category
        $relatedProducts = Product::query()
            ->active()
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->take(4)
            ->get();

        return Inertia::render('Shop/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
