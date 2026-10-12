<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Catalog\CategoryService;
use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductDetailController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected SettingService $settingService
    ) {}

    /**
     * Display Single Product Detail Page with High-Res Gallery and Dynamic Variants.
     */
    public function show(string $slug): Response
    {
        $product = Product::query()
            ->active()
            ->where('slug', $slug)
            ->with([
                'category:id,name,slug,parent_id',
                'brand:id,name,slug,logo',
                'images' => fn($q) => $q->orderBy('display_order'),
                'variants' => fn($q) => $q->where('is_active', true),
            ])
            ->firstOrFail();

        // Related products in the same category or brand
        $relatedProducts = Product::query()
            ->active()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product) {
                if ($product->category_id) {
                    $q->where('category_id', $product->category_id);
                }
                if ($product->brand_id) {
                    $q->orWhere('brand_id', $product->brand_id);
                }
            })
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->take(4)
            ->get();

        if ($relatedProducts->isEmpty()) {
            $relatedProducts = Product::query()
                ->active()
                ->where('id', '!=', $product->id)
                ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
                ->take(4)
                ->get();
        }

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'navCategories' => $this->categoryService->getStorefrontNavTree(),
            'settings' => $this->settingService->getSettings(),
        ]);
    }
}
