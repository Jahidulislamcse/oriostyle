<?php

namespace App\Services\Storefront;

use App\Models\Product;
use App\Models\StockNotification;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistService
{
    /**
     * Resolve the active guest session identifier from request headers, cookies, or Laravel session.
     */
    public function resolveSessionId(Request $request): string
    {
        return $request->header('X-Cart-Session')
            ?: ($request->cookie('cart_session') ?: $request->session()->getId());
    }

    /**
     * Get all wishlist items for a customer or guest session, eager-loading product details.
     */
    public function getWishlistItems(?User $user, ?string $sessionId): Collection
    {
        if (!$user && !$sessionId) {
            return new Collection();
        }

        return Wishlist::forUserOrSession($user, $sessionId)
            ->with([
                'product' => function ($q) {
                    $q->with(['primaryImage', 'brand', 'variants']);
                },
            ])
            ->latest()
            ->get();
    }

    /**
     * Get an array of product IDs currently in the user's or guest's wishlist.
     */
    public function getWishlistProductIds(?User $user, ?string $sessionId): array
    {
        if (!$user && !$sessionId) {
            return [];
        }

        return Wishlist::forUserOrSession($user, $sessionId)
            ->pluck('product_id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    /**
     * Get total count of items in the wishlist.
     */
    public function getWishlistCount(?User $user, ?string $sessionId): int
    {
        if (!$user && !$sessionId) {
            return 0;
        }

        return Wishlist::forUserOrSession($user, $sessionId)->count();
    }

    /**
     * Toggle a product in/out of the wishlist.
     * Returns ['is_wishlisted' => bool, 'count' => int].
     */
    public function toggle(?User $user, ?string $sessionId, int $productId): array
    {
        $existing = Wishlist::forUserOrSession($user, $sessionId)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            $isWishlisted = false;
        } else {
            Wishlist::create([
                'user_id' => $user?->id,
                'session_id' => $user ? null : $sessionId,
                'product_id' => $productId,
            ]);
            $isWishlisted = true;
        }

        $count = $this->getWishlistCount($user, $sessionId);

        return [
            'is_wishlisted' => $isWishlisted,
            'count' => $count,
        ];
    }

    /**
     * Remove an item from the wishlist.
     */
    public function remove(?User $user, ?string $sessionId, int $productId): bool
    {
        $deleted = Wishlist::forUserOrSession($user, $sessionId)
            ->where('product_id', $productId)
            ->delete();

        return $deleted > 0;
    }

    /**
     * Merge guest wishlist items into customer account upon login.
     */
    public function mergeGuestWishlistIntoUser(string $sessionId, User $user): void
    {
        $guestItems = Wishlist::where('session_id', $sessionId)
            ->whereNull('user_id')
            ->get();

        if ($guestItems->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($guestItems, $user) {
            $userProductIds = Wishlist::where('user_id', $user->id)
                ->pluck('product_id')
                ->all();

            foreach ($guestItems as $item) {
                if (in_array($item->product_id, $userProductIds, true)) {
                    // Item already in user's wishlist, delete guest copy to prevent duplicates
                    $item->delete();
                } else {
                    // Reassign item to user
                    $item->update([
                        'user_id' => $user->id,
                        'session_id' => null,
                    ]);
                    $userProductIds[] = $item->product_id;
                }
            }
        });
    }

    /**
     * Register a back-in-stock notification alert for an out-of-stock product or variant.
     */
    public function registerStockNotification(
        int $productId,
        ?int $variantId,
        string $email,
        ?string $phone = null,
        ?User $user = null
    ): StockNotification {
        return StockNotification::updateOrCreate(
            [
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'email' => strtolower(trim($email)),
            ],
            [
                'user_id' => $user?->id,
                'phone' => $phone ? trim($phone) : null,
                'is_notified' => false,
            ]
        );
    }
}
