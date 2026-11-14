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
use App\Services\Storefront\HomepageBentoService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected ProductService $productService,
        protected BrandService $brandService,
        protected SettingService $settingService,
        protected BannerService $bannerService,
        protected HomepageBentoService $bentoService
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
            ->with(['parent:id,name,slug', 'images', 'featuredImage'])
            ->withCount(['products' => fn($q) => $q->where('is_active', true)])
            ->orderByRaw('CASE WHEN parent_id IS NOT NULL THEN 0 ELSE 1 END')
            ->orderBy('display_order')
            ->take(16)
            ->get();

        if ($featuredCategories->isEmpty()) {
            $featuredCategories = Category::query()
                ->active()
                ->with(['parent:id,name,slug', 'images', 'featuredImage'])
                ->withCount(['products' => fn($q) => $q->where('is_active', true)])
                ->orderByRaw('CASE WHEN parent_id IS NOT NULL THEN 0 ELSE 1 END')
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

        // 1. New Arrivals: Prioritize active products marked as is_new_arrival,
        // or fallback to newest active products so the homepage is always fresh.
        $newArrivals = Product::query()
            ->active()
            ->where('is_new_arrival', true)
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        if ($newArrivals->isEmpty()) {
            $newArrivals = Product::query()
                ->active()
                ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get();
        }

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
        $bentoSlots = $this->bentoService->getActiveSlotsForStorefront();

        // 2. Fetch featured categories for promotional collection showcases.
        // Dynamic & strictly controlled by the admin: Categories marked as is_featured = true.
        // Each category showcase pulls products from the category itself AND all its descendant subcategories.
        $featuredShowcaseCategories = Category::query()
            ->active()
            ->featured()
            ->with('allChildren')
            ->orderBy('display_order')
            ->take(6)
            ->get();

        // If admin hasn't marked any category as featured yet, fallback to active categories with banner or products
        // so the homepage isn't completely empty before admin setup.
        if ($featuredShowcaseCategories->isEmpty()) {
            $featuredShowcaseCategories = Category::query()
                ->active()
                ->where(function ($q) {
                    $q->whereNotNull('banner')->where('banner', '!=', '')
                      ->orWhereHas('products', fn($pq) => $pq->active());
                })
                ->with('allChildren')
                ->orderBy('display_order')
                ->take(4)
                ->get();
        }

        $fallbackBanners = [
            '/storefront/img/banner/1.jpg',
            '/storefront/img/banner/2.jpg',
            '/storefront/img/banner/5.jpg',
            '/storefront/img/banner/6.jpg',
        ];

        $categoryShowcases = $featuredShowcaseCategories->map(function (Category $category, int $index) use ($fallbackBanners) {
            $categoryIds = array_merge([$category->id], $category->getAllDescendantIds());

            $products = Product::query()
                ->active()
                ->whereIn('category_id', $categoryIds)
                ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
                ->orderBy('id', 'desc')
                ->take(6)
                ->get();

            // Set the products relation on this category
            $category->setRelation('products', $products);

            // Assign fallback banner if no panoramic banner was uploaded
            if (empty($category->banner)) {
                $category->banner = $fallbackBanners[$index % count($fallbackBanners)];
            }

            return $category;
        })->filter(function (Category $category) {
            // Only include showcases that actually have products to display
            return $category->products && $category->products->isNotEmpty();
        })->values();

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
            'bentoSlots' => $bentoSlots,
            'categoryShowcases' => $categoryShowcases,
        ]);
    }
}
