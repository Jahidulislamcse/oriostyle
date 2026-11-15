<?php

namespace App\Http\Middleware;

use App\Services\Admin\AdminNotificationService;
use App\Services\Catalog\CategoryService;
use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var SettingService $settingService */
        $settingService = app(SettingService::class);
        $settings = $settingService->getAllPublicCached();

        return [
            ...parent::share($request),
            'appName' => $settings['site_name'] ?? config('app.name', 'ORIO STYLE'),
            'settings' => $settings,
            'navCategories' => fn () => app(CategoryService::class)->getStorefrontNavTree(),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone ?? null,
                    'role' => $request->user()->role ?? 'customer',
                    'is_active' => (bool) ($request->user()->is_active ?? true),
                ] : null,
            ],
            'cart' => function () use ($request) {
                /** @var \App\Services\Storefront\CartService $cartService */
                $cartService = app(\App\Services\Storefront\CartService::class);
                $sessionId = $request->header('X-Cart-Session')
                    ?: ($request->cookie('cart_session') ?: $request->session()->getId());
                $cart = $cartService->getOrCreateCart($request->user(), $sessionId);
                return $cartService->formatCartPayload($cart);
            },
            'wishlistCount' => function () use ($request) {
                /** @var \App\Services\Storefront\WishlistService $wishlistService */
                $wishlistService = app(\App\Services\Storefront\WishlistService::class);
                $sessionId = $wishlistService->resolveSessionId($request);
                return $wishlistService->getWishlistCount($request->user(), $sessionId);
            },
            'wishlistProductIds' => function () use ($request) {
                /** @var \App\Services\Storefront\WishlistService $wishlistService */
                $wishlistService = app(\App\Services\Storefront\WishlistService::class);
                $sessionId = $wishlistService->resolveSessionId($request);
                return $wishlistService->getWishlistProductIds($request->user(), $sessionId);
            },
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
                'url' => $request->getSchemeAndHttpHost(),
                'port' => ($request->getPort() !== 80 && $request->getPort() !== 443 && !app()->environment('production')) ? $request->getPort() : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'adminNotifications' => function () use ($request) {
                $user = $request->user();
                if (!$user || !in_array($user->role, ['super_admin', 'admin', 'manager', 'inventory_staff'], true)) {
                    return null;
                }
                return app(AdminNotificationService::class)->getHeaderAlerts();
            },
            'offerPopup' => function () use ($settings) {
                if (empty($settings['popup_enabled']) || !filter_var($settings['popup_enabled'], FILTER_VALIDATE_BOOLEAN)) {
                    return null;
                }

                $productId = $settings['popup_product_id'] ?? null;
                $product = null;

                if ($productId) {
                    $product = \App\Models\Product::query()
                        ->active()
                        ->with(['primaryImage', 'images', 'category:id,name,slug', 'brand:id,name,slug'])
                        ->find($productId);
                }

                if (!$product) {
                    $product = \App\Models\Product::query()
                        ->active()
                        ->whereNotNull('sale_price')
                        ->where('sale_price', '>', 0)
                        ->with(['primaryImage', 'images', 'category:id,name,slug', 'brand:id,name,slug'])
                        ->orderBy('id', 'desc')
                        ->first();
                }

                if (!$product) {
                    $product = \App\Models\Product::query()
                        ->active()
                        ->with(['primaryImage', 'images', 'category:id,name,slug', 'brand:id,name,slug'])
                        ->orderBy('id', 'desc')
                        ->first();
                }

                if (!$product) {
                    return null;
                }

                $rawImg = $product->primaryImage?->image_path ?: ($product->images->first()?->image_path ?? null);
                $imageUrl = \App\Support\UrlSanitizer::sanitize($rawImg);

                $basePrice = (float) ($product->base_price ?? 0);
                $salePrice = $product->sale_price !== null ? (float) $product->sale_price : null;
                $discountPercentage = ($salePrice !== null && $salePrice > 0 && $salePrice < $basePrice && $basePrice > 0)
                    ? (int) round((($basePrice - $salePrice) / $basePrice) * 100)
                    : 0;

                return [
                    'enabled' => true,
                    'title' => $settings['popup_title'] ?: 'EXCLUSIVE SPECIAL OFFER',
                    'subtitle' => $settings['popup_subtitle'] ?: 'Unlock a limited-time luxury discount on our handcrafted signature piece!',
                    'badge_text' => $settings['popup_badge_text'] ?: 'FLASH DEAL',
                    'coupon_code' => $settings['popup_coupon_code'] ?: '',
                    'button_text' => $settings['popup_button_text'] ?: 'Claim Offer Now',
                    'delay_seconds' => (int) ($settings['popup_delay_seconds'] ?? 3),
                    'show_once' => (bool) ($settings['popup_show_once_per_session'] ?? true),
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'sku' => $product->sku,
                        'base_price' => $basePrice,
                        'sale_price' => $salePrice,
                        'discount_percentage' => $discountPercentage,
                        'category_name' => $product->category?->name,
                        'brand_name' => $product->brand?->name,
                        'image_url' => $imageUrl,
                        'url' => route('products.show', $product->slug, false),
                    ],
                ];
            },
        ];
    }
}
