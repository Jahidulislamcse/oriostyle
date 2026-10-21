<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'min_order_amount',
        'max_discount_cap',
        'usage_limit_total',
        'usage_limit_per_user',
        'times_used',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'min_order_amount' => 'float',
        'max_discount_cap' => 'float',
        'usage_limit_total' => 'integer',
        'usage_limit_per_user' => 'integer',
        'times_used' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: Usages log
     */
    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Scope: Active coupons
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Lookup by coupon code (case-insensitive)
     */
    public function scopeValidForCode(Builder $query, string $code): Builder
    {
        return $query->where('code', strtoupper(trim($code)))
            ->where('is_active', true);
    }

    /**
     * Check if coupon is currently within active date window.
     */
    public function isWithinDateWindow(): bool
    {
        $now = Carbon::now();

        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        return true;
    }

    /**
     * Check if total coupon usage limit is exceeded.
     */
    public function isTotalUsageLimitExceeded(): bool
    {
        if ($this->usage_limit_total !== null && $this->times_used >= $this->usage_limit_total) {
            return true;
        }

        return false;
    }

    /**
     * Check if user/email has exceeded their personal usage limit.
     */
    public function isUserUsageLimitExceeded(?User $user = null, ?string $customerEmail = null): bool
    {
        if (!$this->usage_limit_per_user) {
            return false;
        }

        $query = $this->usages();

        if ($user) {
            $userUsages = (clone $query)->where('user_id', $user->id)->count();
            if ($userUsages >= $this->usage_limit_per_user) {
                return true;
            }
        }

        if ($customerEmail) {
            $emailUsages = (clone $query)->where('customer_email', strtolower(trim($customerEmail)))->count();
            if ($emailUsages >= $this->usage_limit_per_user) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate discount amount against an eligible subtotal.
     */
    public function calculateDiscount(float $subtotal): float
    {
        if ($subtotal < $this->min_order_amount) {
            return 0.00;
        }

        $discount = 0.00;

        if ($this->discount_type === 'percentage') {
            $discount = ($subtotal * $this->discount_value) / 100.0;

            if ($this->max_discount_cap !== null && $this->max_discount_cap > 0) {
                $discount = min($discount, $this->max_discount_cap);
            }
        } elseif ($this->discount_type === 'fixed') {
            $discount = min((float) $this->discount_value, $subtotal);
        }

        return round(max(0.00, $discount), 2);
    }

    /**
     * Record usage for a completed order.
     */
    public function recordUsage(?User $user, ?Order $order, float $discountAmount, ?string $customerEmail = null): CouponUsage
    {
        $usage = $this->usages()->create([
            'user_id' => $user?->id,
            'order_id' => $order?->id,
            'customer_email' => $customerEmail ?: $user?->email,
            'discount_amount' => $discountAmount,
        ]);

        $this->increment('times_used');

        return $usage;
    }
}
