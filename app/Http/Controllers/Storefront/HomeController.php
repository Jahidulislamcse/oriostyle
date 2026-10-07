<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\Catalog\BannerService;
use App\Services\Catalog\BrandService;
use App\Services\Catalog\CategoryService;
use App\Services\Catalog\ProductService;
use App\Services\Settings\SettingService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected ProductService $productService,
        protected BrandService $brandService,
        protected SettingService $settingService,
        protected BannerService $bannerService
    ) {}

    /**
     * Display Storefront Landing Homepage via Inertia React.
     */
    public function index(): Response
    {
        $navCategories = $this->categoryService->getStorefrontNavTree();

        $featuredCategories = Category::query()
            ->active()
            ->featured()
            ->subcategory()
            ->with(['parent:id,name,slug', 'images', 'featuredImage'])
            ->withCount(['products' => fn($q) => $q->where('is_active', true)])
            ->orderBy('display_order')
            ->take(16)
            ->get();

        if ($featuredCategories->isEmpty()) {
            $featuredCategories = Category::query()
                ->active()
                ->subcategory()
                ->with(['parent:id,name,slug', 'images', 'featuredImage'])
                ->withCount(['products' => fn($q) => $q->where('is_active', true)])
                ->orderBy('display_order')
                ->take(16)
                ->get();
        }

        if ($featuredCategories->isEmpty()) {
            $featuredCategories = Category::query()
                ->active()
                ->with(['parent:id,name,slug', 'images', 'featuredImage'])
                ->withCount(['products' => fn($q) => $q->where('is_active', true)])
                ->orderBy('display_order')
                ->take(16)
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

        $bannersGrouped = $this->bannerService->getActiveStorefrontBanners();
        $heroBanners = $bannersGrouped->get('hero', collect())->values();
        $splitBanners = $bannersGrouped->get('split', collect())->values();
        $promoBanners = $bannersGrouped->get('promo', collect())->values();

        return Inertia::render('Storefront/Index', [
            'navCategories' => $navCategories,
            'featuredCategories' => $featuredCategories,
            'featuredProducts' => $featuredProducts,
            'newArrivals' => $newArrivals,
            'brands' => $brands,
            'settings' => $settings,
            'heroBanners' => $heroBanners,
            'splitBanners' => $splitBanners,
            'promoBanners' => $promoBanners,
        ]);
    }
}
