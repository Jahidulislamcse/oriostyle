<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'product_sku',
        'variant_attributes',
        'unit_price',
        'quantity',
        'line_total',
        'image_path',
    ];

    protected function casts(): array
    {
        return [
            'variant_attributes' => 'array',
            'unit_price' => 'decimal:2',
            'line_total' => 'decimal:2',
            'quantity' => 'integer',
        ];
    }

    protected $appends = [
        'image_url',
        'formatted_variant',
    ];

    /**
     * Relationship: Parent Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * Relationship: Product Reference
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Relationship: Product Variant Reference
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Accessor: Clean Image URL for thumbnail display
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!empty($this->image_path)) {
            if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://') || str_starts_with($this->image_path, '/')) {
                return $this->image_path;
            }

            return '/storage/' . ltrim($this->image_path, '/');
        }

        if ($this->relationLoaded('product') && $this->product) {
            return $this->product->image_url ?? null;
        }

        return null;
    }

    /**
     * Accessor: Human-readable variant description
     */
    public function getFormattedVariantAttribute(): ?string
    {
        if (empty($this->variant_attributes) || !is_array($this->variant_attributes)) {
            return null;
        }

        $parts = [];
        foreach ($this->variant_attributes as $key => $val) {
            if ($val !== null && $val !== '') {
                $parts[] = ucfirst((string) $key) . ': ' . $val;
            }
        }

        return !empty($parts) ? implode(' | ', $parts) : null;
    }
}
