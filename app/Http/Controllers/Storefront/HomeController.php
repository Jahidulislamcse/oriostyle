<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\Catalog\BrandService;
use App\Services\Catalog\CategoryService;
use App\Services\Catalog\ProductService;
use App\Services\Settings\SettingService;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected ProductService $productService,
        protected BrandService $brandService,
        protected SettingService $settingService
    ) {}

    /**
     * Display Storefront Landing / Homepage.
     */
    public function index(): View
    {
        $navCategories = $this->categoryService->getStorefrontNavTree();

        $featuredCategories = Category::query()
            ->active()
            ->featured()
            ->withCount(['products' => fn($q) => $q->where('is_active', true)])
            ->orderBy('display_order')
            ->take(6)
            ->get();

        if ($featuredCategories->isEmpty()) {
            $featuredCategories = Category::query()
                ->active()
                ->withCount(['products' => fn($q) => $q->where('is_active', true)])
                ->orderBy('display_order')
                ->take(6)
                ->get();
        }

        $featuredProducts = Product::query()
            ->active()
            ->featured()
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->orderBy('id', 'desc')
            ->take(8)
            ->get();

        if ($featuredProducts->isEmpty()) {
            $featuredProducts = Product::query()
                ->active()
                ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
                ->orderBy('id', 'desc')
                ->take(8)
                ->get();
        }

        $newArrivals = Product::query()
            ->active()
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        $brands = Brand::query()
            ->active()
            ->featured()
            ->orderBy('display_order')
            ->get();

        if ($brands->isEmpty()) {
            $brands = Brand::query()
                ->active()
                ->orderBy('display_order')
                ->take(10)
                ->get();
        }

        $settings = $this->settingService->getSettings();

        return view('storefront.index', compact(
            'navCategories',
            'featuredCategories',
            'featuredProducts',
            'newArrivals',
            'brands',
            'settings'
        ));
    }
}
