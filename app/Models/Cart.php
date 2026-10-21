<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    public const DEFAULT_FREE_SHIPPING_THRESHOLD = 3000.00;

    protected $fillable = [
        'user_id',
        'session_id',
        'coupon_code',
        'notes',
    ];

    protected $appends = [
        'subtotal',
        'items_count',
        'is_free_shipping',
        'amount_for_free_shipping',
        'free_shipping_progress',
    ];

    /**
     * Relationship: Cart Line Items
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'cart_id');
    }

    /**
     * Relationship: Authenticated User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Accessor: Total count of items across all lines
     */
    public function getItemsCountAttribute(): int
    {
        if ($this->relationLoaded('items')) {
            return (int) $this->items->sum('quantity');
        }

        return (int) $this->items()->sum('quantity');
    }

    /**
     * Accessor: Subtotal of all items
     */
    public function getSubtotalAttribute(): float
    {
        if ($this->relationLoaded('items')) {
            return (float) $this->items->sum(fn (CartItem $item) => $item->line_total);
        }

        return (float) $this->items()->get()->sum(fn (CartItem $item) => $item->line_total);
    }

    /**
     * Accessor: Free shipping eligibility
     */
    public function getIsFreeShippingAttribute(): bool
    {
        return $this->subtotal >= self::DEFAULT_FREE_SHIPPING_THRESHOLD;
    }

    /**
     * Accessor: Amount remaining to unlock free delivery
     */
    public function getAmountForFreeShippingAttribute(): float
    {
        $remaining = self::DEFAULT_FREE_SHIPPING_THRESHOLD - $this->subtotal;
        return max(0.00, (float) $remaining);
    }

    /**
     * Accessor: Progress percentage toward free delivery (0 - 100)
     */
    public function getFreeShippingProgressAttribute(): int
    {
        if ($this->subtotal <= 0) {
            return 0;
        }

        $percentage = ($this->subtotal / self::DEFAULT_FREE_SHIPPING_THRESHOLD) * 100;
        return min(100, (int) round($percentage));
    }
}
