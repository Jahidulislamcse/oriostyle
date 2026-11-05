<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBundle;
use App\Models\ProductVariant;
use App\Services\Storefront\CartService;
use App\Services\Storefront\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function __construct(
        protected WishlistService $wishlistService,
        protected CartService $cartService
    ) {}

    /**
     * Display the customer's curated luxury wishlist page.
     */
    public function index(Request $request): Response
    {
        $sessionId = $this->wishlistService->resolveSessionId($request);
        $wishlistRecords = $this->wishlistService->getWishlistItems($request->user(), $sessionId);

        $items = $wishlistRecords->map(function ($record) {
            $product = $record->product;
            if (!$product) {
                return null;
            }

            return [
                'id' => $record->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'base_price' => (float) $product->base_price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'effective_price' => (float) $product->effective_price,
                'is_on_sale' => $product->is_on_sale,
                'stock_quantity' => (int) $product->stock_quantity,
                'is_in_stock' => (int) $product->stock_quantity > 0,
                'primary_image_url' => $product->primary_image_url,
                'brand_name' => $product->brand?->name ?? 'ORIO STYLE',
                'created_at' => $record->created_at?->toIso8601String(),
            ];
        })->filter()->values();

        return Inertia::render('Storefront/Wishlist', [
            'wishlistItems' => $items,
        ]);
    }

    /**
     * Toggle a product in/out of the customer's wishlist.
     */
    public function toggle(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $productId = (int) $request->input('product_id');
        $sessionId = $this->wishlistService->resolveSessionId($request);

        $result = $this->wishlistService->toggle(
            $request->user(),
            $sessionId,
            $productId
        );

        $message = $result['is_wishlisted']
            ? 'Item added to your wishlist.'
            : 'Item removed from your wishlist.';

        if ($request->wantsJson() || $request->header('X-Inertia') === null) {
            return response()->json([
                'success' => true,
                'is_wishlisted' => $result['is_wishlisted'],
                'count' => $result['count'],
                'message' => $message,
            ]);
        }

        return back()->with('success', $message);
    }

    /**
     * Remove a product from the wishlist.
     */
    public function destroy(Request $request, int $productId): RedirectResponse|JsonResponse
    {
        $sessionId = $this->wishlistService->resolveSessionId($request);
        $this->wishlistService->remove($request->user(), $sessionId, $productId);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'count' => $this->wishlistService->getWishlistCount($request->user(), $sessionId),
                'message' => 'Item removed from your wishlist.',
            ]);
        }

        return back()->with('success', 'Item removed from your wishlist.');
    }

    /**
     * Add a complete outfit bundle / "Frequently Bought Together" set to the cart with bundle discount.
     */
    public function addBundleToCart(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'nullable|integer|min:1',
        ]);

        $cart = $this->cartService->getCartForRequest($request);

        foreach ($request->input('items') as $bundleItem) {
            $productId = (int) $bundleItem['product_id'];
            $variantId = !empty($bundleItem['variant_id']) ? (int) $bundleItem['variant_id'] : null;
            $quantity = !empty($bundleItem['quantity']) ? (int) $bundleItem['quantity'] : 1;

            // If variant is not selected, pick first in-stock variant if variants exist
            if (!$variantId) {
                $firstVariant = ProductVariant::where('product_id', $productId)
                    ->where('stock_quantity', '>', 0)
                    ->first();
                $variantId = $firstVariant?->id;
            }

            $this->cartService->addItem($cart, $productId, $variantId, $quantity);
        }

        return back()->with('success', 'Curated outfit bundle successfully added to your cart!');
    }

    /**
     * Register a back-in-stock notification alert for out-of-stock items.
     */
    public function notifyStock(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'product_variant_id' => 'nullable|integer|exists:product_variants,id',
            'email' => 'required|email|max:190',
            'phone' => 'nullable|string|max:30',
        ]);

        $this->wishlistService->registerStockNotification(
            (int) $request->input('product_id'),
            $request->input('product_variant_id') ? (int) $request->input('product_variant_id') : null,
            $request->input('email'),
            $request->input('phone'),
            $request->user()
        );

        $msg = "Thank you! We'll notify you as soon as this item is back in stock.";

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => $msg]);
        }

        return back()->with('success', $msg);
    }
}
