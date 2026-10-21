<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'product_variant_id',
        'quantity',
    ];

    protected $with = ['product', 'variant'];

    protected $casts = [
        'quantity' => 'integer',
    ];

    protected $appends = [
        'unit_price',
        'line_total',
        'available_stock',
        'product_name',
        'product_slug',
        'image_url',
        'variant_summary',
        'sku',
    ];

    /**
     * Relationship: Parent Cart
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    /**
     * Relationship: Associated Product
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Relationship: Associated Variant (nullable)
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Accessor: Unit price considering discounts and variant price adjustments
     */
    public function getUnitPriceAttribute(): float
    {
        $base = 0.00;
        if ($this->product) {
            $base = (float) ($this->product->sale_price ?: $this->product->base_price);
        }

        if ($this->product_variant_id && $this->variant) {
            $base += (float) ($this->variant->price_adjustment ?? 0.00);
        }

        return max(0.00, $base);
    }

    /**
     * Accessor: Line total
     */
    public function getLineTotalAttribute(): float
    {
        return (float) ($this->unit_price * $this->quantity);
    }

    /**
     * Accessor: Available stock for this specific item/variant
     */
    public function getAvailableStockAttribute(): int
    {
        if ($this->product_variant_id && $this->variant) {
            return (int) $this->variant->stock_quantity;
        }

        if ($this->product) {
            return (int) $this->product->stock_quantity;
        }

        return 0;
    }

    /**
     * Accessor: Product Name
     */
    public function getProductNameAttribute(): string
    {
        return $this->product->name ?? 'Product';
    }

    /**
     * Accessor: Product Slug
     */
    public function getProductSlugAttribute(): string
    {
        return $this->product->slug ?? '';
    }

    /**
     * Accessor: SKU
     */
    public function getSkuAttribute(): ?string
    {
        if ($this->product_variant_id && $this->variant && !empty($this->variant->sku)) {
            return $this->variant->sku;
        }

        return $this->product->sku ?? null;
    }

    /**
     * Accessor: Image URL
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->product->image_url ?? null;
    }

    /**
     * Accessor: Variant attributes summary (e.g. "Size: XL | Color: Navy")
     */
    public function getVariantSummaryAttribute(): ?string
    {
        if (!$this->product_variant_id || !$this->variant) {
            return null;
        }

        $parts = [];
        if (!empty($this->variant->size)) {
            $parts[] = 'Size: ' . $this->variant->size;
        }
        if (!empty($this->variant->color)) {
            $parts[] = 'Color: ' . $this->variant->color;
        }

        return !empty($parts) ? implode(' • ', $parts) : null;
    }
}
