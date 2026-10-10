<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InventoryMovement extends Model
{
    use HasFactory;

    // Movement types
    public const TYPE_PURCHASE_IN = 'purchase_in';
    public const TYPE_ORDER_OUT = 'order_out';
    public const TYPE_ADJUSTMENT_INCREASE = 'adjustment_increase';
    public const TYPE_ADJUSTMENT_DECREASE = 'adjustment_decrease';
    public const TYPE_DAMAGE_LOSS = 'damage_loss';
    public const TYPE_RETURN_IN = 'return_in';
    public const TYPE_CYCLE_COUNT = 'cycle_count';

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'unit_cost',
        'total_cost',
        'reason',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    /**
     * Product associated with movement.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Variant associated with movement (if applicable).
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * User who initiated movement.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Polymorphic reference (PurchaseOrder, Order, DamageLog, etc.)
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope for filtering by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
