<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
    ];

    /**
     * Relationship: The customer who owns this wishlist item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relationship: The wishlisted product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Scope to filter wishlist items for a given user or guest session.
     */
    public function scopeForUserOrSession(Builder $query, ?User $user, ?string $sessionId): Builder
    {
        if ($user) {
            return $query->where('user_id', $user->id);
        }

        return $query->where('session_id', $sessionId)->whereNull('user_id');
    }
}
