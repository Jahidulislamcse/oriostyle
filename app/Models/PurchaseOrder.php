<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_ORDERED = 'ordered';
    public const STATUS_RECEIVED = 'received';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ORDERED,
        self::STATUS_RECEIVED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'po_number',
        'supplier_id',
        'status',
        'order_date',
        'expected_delivery_date',
        'received_date',
        'subtotal',
        'shipping_cost',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'notes',
        'created_by',
        'received_by',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'expected_delivery_date' => 'date',
            'received_date' => 'date',
            'subtotal' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    /**
     * Relationship: Supplier
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * Relationship: Order line items
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id');
    }

    /**
     * Relationship: User who created the PO
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: User who received the PO
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Check if editable.
     */
    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Check if can be ordered (sent to supplier).
     */
    public function canBeOrdered(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Check if ready for receiving / stock-in.
     */
    public function canBeReceived(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_ORDERED], true);
    }

    /**
     * Check if can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_ORDERED], true);
    }

    /**
     * Scopes
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ORDERED);
    }

    public function scopeReceived(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_RECEIVED);
    }
}
