<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductBundle extends Model
{
    use HasFactory;

    protected $fillable = [
        'main_product_id',
        'paired_product_id',
        'discount_percentage',
        'badge_label',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Relationship: The anchor/main product shown on the product detail page.
     */
    public function mainProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'main_product_id');
    }

    /**
     * Relationship: The companion product paired in this bundle (e.g. Pajama or Cap).
     */
    public function pairedProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'paired_product_id');
    }

    /**
     * Scope: Only active bundles.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('display_order');
    }
}
