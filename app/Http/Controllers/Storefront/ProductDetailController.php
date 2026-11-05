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
                'bundles' => fn($q) => $q->active()->with([
                    'pairedProduct.primaryImage',
                    'pairedProduct.brand',
                    'pairedProduct.variants' => fn($vq) => $vq->where('is_active', true),
                ]),
            ])
            ->firstOrFail();

        // If no explicit bundles exist, generate smart companion pairing
        $curatedBundles = $product->bundles;
        if ($curatedBundles->isEmpty()) {
            $companions = Product::query()
                ->active()
                ->where('id', '!=', $product->id)
                ->with(['primaryImage', 'brand', 'variants' => fn($vq) => $vq->where('is_active', true)])
                ->take(2)
                ->get();

            $curatedBundles = $companions->map(function ($comp, $idx) use ($product) {
                return (object) [
                    'id' => 'smart_' . $comp->id,
                    'main_product_id' => $product->id,
                    'paired_product_id' => $comp->id,
                    'discount_percentage' => 5.00,
                    'badge_label' => $idx === 0 ? 'Frequently Bought Together' : 'Complete The Look',
                    'paired_product' => $comp,
                ];
            });
        }
        $product->setRelation('bundles', $curatedBundles);

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
