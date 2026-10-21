<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\Storefront\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Resolve the active cart using User auth, Session ID, or persistent Cart cookie/header.
     */
    protected function getCart(Request $request): Cart
    {
        $sessionId = $request->header('X-Cart-Session')
            ?: ($request->cookie('cart_session') ?: $request->session()->getId());

        $cart = $this->cartService->getOrCreateCart($request->user(), $sessionId);

        if (!$request->user() && $sessionId) {
            cookie()->queue('cart_session', $sessionId, 60 * 24 * 30);
        }

        return $cart;
    }

    /**
     * Get current active cart data.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->getCart($request);

        return response()->json([
            'success' => true,
            'cart' => $this->cartService->formatCartPayload($cart),
        ]);
    }

    /**
     * Add an item to the shopping cart.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ]);

        $cart = $this->getCart($request);

        $cartItem = $this->cartService->addItem(
            $cart,
            (int) $validated['product_id'],
            isset($validated['product_variant_id']) ? (int) $validated['product_variant_id'] : null,
            (int) ($validated['quantity'] ?? 1)
        );

        $payload = $this->cartService->formatCartPayload($cart->fresh());

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Item added to your shopping bag.',
                'item' => $cartItem,
                'cart' => $payload,
            ]);
        }

        return back()->with([
            'success' => 'Item added to your shopping bag.',
            'cart' => $payload,
        ]);
    }

    /**
     * Update quantity for a specific cart line item.
     */
    public function update(Request $request, CartItem $cartItem): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart = $this->getCart($request);

        if ($cartItem->cart_id !== $cart->id) {
            abort(403, 'Unauthorized cart item.');
        }

        $this->cartService->updateQuantity(
            $cart,
            $cartItem->id,
            (int) $validated['quantity']
        );

        $payload = $this->cartService->formatCartPayload($cart->fresh());

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Shopping bag updated.',
                'cart' => $payload,
            ]);
        }

        return back()->with([
            'success' => 'Shopping bag updated.',
            'cart' => $payload,
        ]);
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(Request $request, CartItem $cartItem): JsonResponse|RedirectResponse
    {
        $cart = $this->getCart($request);

        if ($cartItem->cart_id !== $cart->id) {
            abort(403, 'Unauthorized cart item.');
        }

        $this->cartService->removeItem($cart, $cartItem->id);

        $payload = $this->cartService->formatCartPayload($cart->fresh());

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Item removed from shopping bag.',
                'cart' => $payload,
            ]);
        }

        return back()->with([
            'success' => 'Item removed from shopping bag.',
            'cart' => $payload,
        ]);
    }

    /**
     * Clear all items in the shopping bag.
     */
    public function clear(Request $request): JsonResponse|RedirectResponse
    {
        $cart = $this->getCart($request);

        $this->cartService->clearCart($cart);

        $payload = $this->cartService->formatCartPayload($cart->fresh());

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Shopping bag cleared.',
                'cart' => $payload,
            ]);
        }

        return back()->with([
            'success' => 'Shopping bag cleared.',
            'cart' => $payload,
        ]);
    }
}
