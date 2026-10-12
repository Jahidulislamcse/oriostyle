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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected ProductService $productService,
        protected BrandService $brandService,
        protected SettingService $settingService
    ) {}

    /**
     * Display Storefront Shop Page with Multi-Facet Filtering, Sorting & Pagination.
     */
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->active()
            ->with(['category:id,name,slug,parent_id', 'brand:id,name,slug', 'primaryImage', 'images']);

        // 1. Category Filtering (Support hierarchical inclusion of descendants)
        $categoryParam = $request->input('category');
        $activeCategory = null;

        if (!empty($categoryParam)) {
            $categorySlugs = is_array($categoryParam)
                ? $categoryParam
                : array_filter(explode(',', (string) $categoryParam));

            if (!empty($categorySlugs)) {
                $matchedCategories = Category::whereIn('slug', $categorySlugs)->get();
                $allCategoryIds = [];

                foreach ($matchedCategories as $cat) {
                    $allCategoryIds[] = $cat->id;
                    $allCategoryIds = array_merge($allCategoryIds, $cat->getAllDescendantIds());
                }

                $allCategoryIds = array_unique($allCategoryIds);

                if (!empty($allCategoryIds)) {
                    $query->whereIn('category_id', $allCategoryIds);
                }

                if ($matchedCategories->count() === 1) {
                    $activeCategory = $matchedCategories->first();
                }
            }
        }

        // 2. Brand Filtering
        $brandParam = $request->input('brand');
        if (!empty($brandParam)) {
            $brandSlugs = is_array($brandParam)
                ? $brandParam
                : array_filter(explode(',', (string) $brandParam));

            if (!empty($brandSlugs)) {
                $query->whereHas('brand', fn($q) => $q->whereIn('slug', $brandSlugs));
            }
        }

        // 3. Price Bounds Filtering
        $effectivePriceSql = 'CAST((CASE WHEN sale_price IS NOT NULL AND sale_price > 0 AND sale_price < base_price THEN sale_price ELSE base_price END) AS DECIMAL(12,2))';

        $minPrice = $request->input('min_price');
        if ($minPrice !== null && is_numeric($minPrice) && (float) $minPrice > 0) {
            $query->whereRaw(
                "{$effectivePriceSql} >= ?",
                [(float) $minPrice]
            );
        }

        $maxPrice = $request->input('max_price');
        if ($maxPrice !== null && is_numeric($maxPrice) && (float) $maxPrice > 0) {
            $query->whereRaw(
                "{$effectivePriceSql} <= ?",
                [(float) $maxPrice]
            );
        }

        // 4. In Stock Only
        if ($request->boolean('in_stock') || $request->input('in_stock') === '1') {
            $query->where('stock_quantity', '>', 0);
        }

        // 5. Keyword Search Query
        $searchTerm = trim((string) ($request->input('search') ?? $request->input('q') ?? ''));
        if ($searchTerm !== '') {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('category', fn($cq) => $cq->where('name', 'like', "%{$searchTerm}%"))
                    ->orWhereHas('brand', fn($bq) => $bq->where('name', 'like', "%{$searchTerm}%"));
            });
        }

        // 6. Sorting
        $sort = (string) $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderByRaw("{$effectivePriceSql} ASC");
                break;
            case 'price_desc':
                $query->orderByRaw("{$effectivePriceSql} DESC");
                break;
            case 'popular':
            case 'featured':
                $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc')->orderBy('id', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
                break;
        }

        // 7. Pagination
        $perPage = (int) $request->input('per_page', 12);
        if ($perPage < 1 || $perPage > 48) {
            $perPage = 12;
        }

        $products = $query->paginate($perPage)->withQueryString();

        // 8. Facet Data for Sidebar Filtering
        $categoriesTree = Category::whereNull('parent_id')
            ->active()
            ->orderBy('display_order')
            ->with([
                'children' => fn($q) => $q->active()->orderBy('display_order')->withCount(['products' => fn($pq) => $pq->active()]),
            ])
            ->withCount(['products' => fn($pq) => $pq->active()])
            ->get();

        $brands = Brand::active()
            ->orderBy('name')
            ->withCount(['products' => fn($pq) => $pq->active()])
            ->get();

        $priceBoundMin = Product::active()->min(DB::raw('CASE WHEN sale_price > 0 AND sale_price < base_price THEN sale_price ELSE base_price END')) ?? 0;
        $priceBoundMax = Product::active()->max('base_price') ?? 10000;

        return Inertia::render('Storefront/Shop', [
            'products' => $products,
            'categoriesTree' => $categoriesTree,
            'brands' => $brands,
            'priceRange' => [
                'min' => (float) floor($priceBoundMin),
                'max' => (float) ceil($priceBoundMax),
            ],
            'filters' => [
                'category' => $request->input('category'),
                'brand' => $request->input('brand'),
                'min_price' => $request->input('min_price'),
                'max_price' => $request->input('max_price'),
                'in_stock' => $request->boolean('in_stock') || $request->input('in_stock') === '1' ? '1' : null,
                'sort' => $sort,
                'search' => $searchTerm !== '' ? $searchTerm : null,
            ],
            'activeCategory' => $activeCategory,
            'navCategories' => $this->categoryService->getStorefrontNavTree(),
            'settings' => $this->settingService->getSettings(),
        ]);
    }

    /**
     * Debounced Live Search Autocomplete JSON endpoint.
     */
    public function search(Request $request): JsonResponse
    {
        $term = trim((string) ($request->input('q') ?? $request->input('search') ?? ''));

        if (mb_strlen($term) < 2) {
            return response()->json([
                'products' => [],
                'categories' => [],
            ]);
        }

        $products = Product::active()
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%");
            })
            ->with(['primaryImage', 'images', 'category:id,name,slug', 'brand:id,name,slug'])
            ->take(8)
            ->get()
            ->map(function (Product $p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'sku' => $p->sku,
                    'effective_price' => $p->effective_price,
                    'base_price' => $p->base_price,
                    'sale_price' => $p->sale_price,
                    'image_url' => $p->primary_image_url ?? '/storefront/img/product/1.jpg',
                    'category_name' => $p->category?->name,
                    'category_slug' => $p->category?->slug,
                    'brand_name' => $p->brand?->name,
                ];
            });

        $categories = Category::active()
            ->where('name', 'like', "%{$term}%")
            ->take(5)
            ->get(['id', 'name', 'slug']);

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
