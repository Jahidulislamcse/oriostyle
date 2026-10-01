<?php

namespace App\Services\Storefront;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class StorefrontService
{
    public const CACHE_HOMEPAGE_KEY = 'storefront:homepage_data';
    public const CACHE_TTL_SECONDS = 3600; // 1 Hour

    /**
     * Get root categories with eager loaded subcategories and active product counts.
     */
    public function getStorefrontCategoriesTree(): Collection
    {
        return Category::query()
            ->active()
            ->rootOnly()
            ->with([
                'children' => fn ($q) => $q->active()->orderBy('display_order')->orderBy('name'),
            ])
            ->withCount(['products' => fn ($q) => $q->active()])
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get featured brand showcases for homepage.
     */
    public function getFeaturedBrands(int $limit = 12): Collection
    {
        return Brand::query()
            ->active()
            ->featured()
            ->withCount(['products' => fn ($q) => $q->active()])
            ->orderBy('display_order')
            ->orderBy('name')
            ->take($limit)
            ->get();
    }

    /**
     * Get featured products showcase.
     */
    public function getFeaturedProducts(int $limit = 8): Collection
    {
        return Product::query()
            ->active()
            ->featured()
            ->with([
                'category:id,name,slug',
                'brand:id,name,slug',
                'primaryImage',
                'images',
            ])
            ->orderBy('id', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Get new arrivals products.
     */
    public function getNewArrivals(int $limit = 8): Collection
    {
        return Product::query()
            ->active()
            ->where('is_new_arrival', true)
            ->with([
                'category:id,name,slug',
                'brand:id,name,slug',
                'primaryImage',
                'images',
            ])
            ->orderBy('id', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Get homepage consolidated dataset with caching.
     */
    public function getHomepageData(): array
    {
        return Cache::remember(self::CACHE_HOMEPAGE_KEY, self::CACHE_TTL_SECONDS, function () {
            return [
                'categoriesTree' => $this->getStorefrontCategoriesTree(),
                'featuredBrands' => $this->getFeaturedBrands(),
                'featuredProducts' => $this->getFeaturedProducts(),
                'newArrivals' => $this->getNewArrivals(),
            ];
        });
    }

    /**
     * Get filtered shop catalog with Anti-N+1 eager loading.
     */
    public function getFilteredShopProducts(
        ?string $search = null,
        ?string $categorySlug = null,
        ?string $brandSlug = null,
        ?float $minPrice = null,
        ?float $maxPrice = null,
        ?string $sort = 'newest',
        bool $inStockOnly = false,
        bool $onSaleOnly = false,
        int $perPage = 12
    ): LengthAwarePaginator {
        $query = Product::query()
            ->active()
            ->with([
                'category:id,name,slug',
                'brand:id,name,slug',
                'primaryImage',
                'images',
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($categorySlug) {
            $category = Category::where('slug', $categorySlug)->first();
            if ($category) {
                $categoryIds = Category::where('id', $category->id)
                    ->orWhere('parent_id', $category->id)
                    ->pluck('id');
                $query->whereIn('category_id', $categoryIds);
            }
        }

        if ($brandSlug) {
            $query->whereHas('brand', fn ($q) => $q->where('slug', $brandSlug));
        }

        if ($minPrice !== null && $minPrice > 0) {
            $query->where('base_price', '>=', $minPrice);
        }

        if ($maxPrice !== null && $maxPrice > 0) {
            $query->where('base_price', '<=', $maxPrice);
        }

        if ($inStockOnly) {
            $query->where('stock_quantity', '>', 0);
        }

        if ($onSaleOnly) {
            $query->whereNotNull('sale_price')->whereColumn('sale_price', '<', 'base_price');
        }

        switch ($sort) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(sale_price, base_price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(sale_price, base_price) DESC');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'oldest':
                $query->orderBy('id', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Flush storefront cache.
     */
    public function flushCache(): void
    {
        Cache::forget(self::CACHE_HOMEPAGE_KEY);
    }
}
