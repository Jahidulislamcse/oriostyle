<?php

namespace App\Services\Storefront;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CartService
{
    /**
     * Resolve or create the active cart instance for user or guest session.
     */
    public function getOrCreateCart(?User $user, ?string $sessionId): Cart
    {
        if ($user) {
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart && $sessionId) {
                // If user doesn't have a cart yet, check if they built a cart as guest
                $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
                if ($guestCart) {
                    $guestCart->update(['user_id' => $user->id]);
                    return $this->getCartWithItems($guestCart);
                }
            }

            if (!$cart) {
                $cart = Cart::create(['user_id' => $user->id]);
            }

            return $this->getCartWithItems($cart);
        }

        if (!$sessionId) {
            $sessionId = session()->getId();
        }

        $cart = Cart::firstOrCreate(
            ['session_id' => $sessionId, 'user_id' => null]
        );

        return $this->getCartWithItems($cart);
    }

    /**
     * Eager load relations for cart line items to prevent lazy loading violations.
     */
    public function getCartWithItems(Cart $cart): Cart
    {
        return $cart->load([
            'items.product.primaryImage',
            'items.product.images',
            'items.variant',
        ]);
    }

    /**
     * Add a product and optional variant into cart with stock validation.
     *
     * @throws ValidationException
     */
    public function addItem(Cart $cart, int $productId, ?int $variantId = null, int $quantity = 1): CartItem
    {
        $product = Product::active()->findOrFail($productId);

        $variant = null;
        if ($variantId) {
            $variant = ProductVariant::where('product_id', $productId)
                ->where('is_active', true)
                ->findOrFail($variantId);
        }

        $availableStock = $variant ? $variant->stock_quantity : $product->stock_quantity;

        if ($availableStock <= 0) {
            throw ValidationException::withMessages([
                'quantity' => 'This product or variant is currently sold out.',
            ]);
        }

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $quantity;

            if ($newQuantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Cannot add more than {$availableStock} units available in stock.",
                ]);
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            if ($quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$availableStock} units available in stock.",
                ]);
            }

            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity,
            ]);
        }

        return $cartItem->load([
            'product.primaryImage',
            'product.images',
            'variant',
        ]);
    }

    /**
     * Update quantity for a specific cart line item.
     *
     * @throws ValidationException
     */
    public function updateQuantity(Cart $cart, int $cartItemId, int $quantity): ?CartItem
    {
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $cartItemId)
            ->firstOrFail();

        if ($quantity <= 0) {
            $cartItem->delete();
            return null;
        }

        $availableStock = $cartItem->available_stock;
        if ($quantity > $availableStock) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$availableStock} units available in stock.",
            ]);
        }

        $cartItem->update(['quantity' => $quantity]);

        return $cartItem->load([
            'product.primaryImage',
            'product.images',
            'variant',
        ]);
    }

    /**
     * Remove line item from cart.
     */
    public function removeItem(Cart $cart, int $cartItemId): bool
    {
        return (bool) CartItem::where('cart_id', $cart->id)
            ->where('id', $cartItemId)
            ->delete();
    }

    /**
     * Clear all items in cart.
     */
    public function clearCart(Cart $cart): bool
    {
        return (bool) CartItem::where('cart_id', $cart->id)->delete();
    }

    /**
     * Transfer guest cart items into customer account upon login.
     */
    public function mergeGuestCartIntoUser(string $sessionId, User $user): void
    {
        $guestCart = Cart::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->with('items')
            ->first();

        if (!$guestCart || $guestCart->items->isEmpty()) {
            return;
        }

        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

        foreach ($guestCart->items as $guestItem) {
            $existing = CartItem::where('cart_id', $userCart->id)
                ->where('product_id', $guestItem->product_id)
                ->where('product_variant_id', $guestItem->product_variant_id)
                ->first();

            if ($existing) {
                $maxStock = $guestItem->available_stock;
                $mergedQty = min($maxStock, $existing->quantity + $guestItem->quantity);
                $existing->update(['quantity' => $mergedQty]);
            } else {
                CartItem::create([
                    'cart_id' => $userCart->id,
                    'product_id' => $guestItem->product_id,
                    'product_variant_id' => $guestItem->product_variant_id,
                    'quantity' => $guestItem->quantity,
                ]);
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();
    }

    /**
     * Format clean cart payload for JSON response or Inertia shared props.
     */
    public function formatCartPayload(Cart $cart): array
    {
        $this->getCartWithItems($cart);

        return [
            'id' => $cart->id,
            'count' => $cart->items_count,
            'subtotal' => $cart->subtotal,
            'formatted_subtotal' => '৳' . number_format($cart->subtotal, 2),
            'is_free_shipping' => $cart->is_free_shipping,
            'amount_for_free_shipping' => $cart->amount_for_free_shipping,
            'free_shipping_progress' => $cart->free_shipping_progress,
            'free_shipping_threshold' => Cart::DEFAULT_FREE_SHIPPING_THRESHOLD,
            'items' => $cart->items->map(fn (CartItem $item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'product_name' => $item->product_name,
                'product_slug' => $item->product_slug,
                'sku' => $item->sku,
                'image_url' => $item->image_url,
                'variant_summary' => $item->variant_summary,
                'unit_price' => $item->unit_price,
                'formatted_unit_price' => '৳' . number_format($item->unit_price, 2),
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
                'formatted_line_total' => '৳' . number_format($item->line_total, 2),
                'available_stock' => $item->available_stock,
            ])->values(),
        ];
    }
}
