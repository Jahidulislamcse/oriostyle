<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'base_price',
        'sale_price',
        'cost_price',
        'stock_quantity',
        'low_stock_threshold',
        'is_active',
        'is_featured',
        'is_new_arrival',
        'meta_title',
        'meta_description',
    ];

    protected $appends = [
        'effective_price',
        'is_on_sale',
        'primary_image_url',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'float',
            'sale_price' => 'float',
            'cost_price' => 'float',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_new_arrival' => 'boolean',
        ];
    }

    /**
     * Relationship: Category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Relationship: Brand
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    /**
     * Relationship: All product images
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('display_order');
    }

    /**
     * Relationship: Primary product image (prioritizes is_primary = true, falls back to display_order)
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class, 'product_id')->orderByDesc('is_primary')->orderBy('display_order');
    }

    /**
     * Relationship: Product variants
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    /**
     * Scope: Only active products
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Featured products
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Low stock items
     */
    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
    }

    /**
     * Accessor: Get primary image URL safely without triggering lazy loading violations.
     */
    public function getPrimaryImageUrlAttribute(): ?string
    {
        if ($this->relationLoaded('primaryImage') && $this->primaryImage) {
            return $this->primaryImage->image_url ?? $this->primaryImage->image_path;
        }

        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            $img = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
            return $img->image_url ?? $img->image_path;
        }

        return null;
    }

    /**
     * Accessor: Get final effective price
     */
    public function getEffectivePriceAttribute(): float
    {
        return ($this->sale_price !== null && $this->sale_price > 0 && $this->sale_price < $this->base_price)
            ? $this->sale_price
            : $this->base_price;
    }

    /**
     * Accessor: Check if on sale
     */
    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null && $this->sale_price > 0 && $this->sale_price < $this->base_price;
    }
}
