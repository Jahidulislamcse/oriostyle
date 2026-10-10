<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'price_adjustment',
        'stock_quantity',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_adjustment' => 'float',
            'stock_quantity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function inventoryMovements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InventoryMovement::class, 'product_variant_id')->latest();
    }

    public function damageLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DamageLog::class, 'product_variant_id')->latest();
    }
}
