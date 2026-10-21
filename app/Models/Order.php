<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SHIPPED = 'shipped';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_RETURNED = 'returned';

    public const ORDER_STATUSES = [
        self::STATUS_PENDING => 'Pending',
        self::STATUS_CONFIRMED => 'Confirmed',
        self::STATUS_PROCESSING => 'Processing',
        self::STATUS_SHIPPED => 'Shipped',
        self::STATUS_DELIVERED => 'Delivered',
        self::STATUS_CANCELLED => 'Cancelled',
        self::STATUS_RETURNED => 'Returned',
    ];

    public const PAYMENT_UNPAID = 'unpaid';
    public const PAYMENT_PAID = 'paid';
    public const PAYMENT_PARTIALLY_PAID = 'partially_paid';
    public const PAYMENT_REFUNDED = 'refunded';

    public const PAYMENT_STATUSES = [
        self::PAYMENT_UNPAID => 'Unpaid',
        self::PAYMENT_PAID => 'Paid',
        self::PAYMENT_PARTIALLY_PAID => 'Partially Paid',
        self::PAYMENT_REFUNDED => 'Refunded',
    ];

    public const METHOD_COD = 'cod';
    public const METHOD_BKASH = 'bkash';
    public const METHOD_NAGAD = 'nagad';
    public const METHOD_BANK = 'bank_transfer';

    public const PAYMENT_METHODS = [
        self::METHOD_COD => 'Cash On Delivery',
        self::METHOD_BKASH => 'bKash Online',
        self::METHOD_NAGAD => 'Nagad',
        self::METHOD_BANK => 'Bank Transfer',
    ];

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'city',
        'zone',
        'postal_code',
        'payment_method',
        'payment_status',
        'order_status',
        'subtotal',
        'shipping_charge',
        'discount_amount',
        'total_amount',
        'currency',
        'customer_notes',
        'admin_notes',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_charge' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'confirmed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Relationship: Order Line Items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Relationship: Registered Customer Account (if authenticated)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Scopes for Order Statuses
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('order_status', self::STATUS_PENDING);
    }

    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->where('order_status', self::STATUS_CONFIRMED);
    }

    public function scopeProcessing(Builder $query): Builder
    {
        return $query->where('order_status', self::STATUS_PROCESSING);
    }

    public function scopeShipped(Builder $query): Builder
    {
        return $query->where('order_status', self::STATUS_SHIPPED);
    }

    public function scopeDelivered(Builder $query): Builder
    {
        return $query->where('order_status', self::STATUS_DELIVERED);
    }

    public function scopeCancelled(Builder $query): Builder
    {
        return $query->where('order_status', self::STATUS_CANCELLED);
    }

    /**
     * Search and Filter Scope
     */
    public function scopeFilter(Builder $query, array $filters = []): Builder
    {
        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function (Builder $q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('order_status', $filters['status']);
        }

        if (!empty($filters['payment_status']) && $filters['payment_status'] !== 'all') {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['payment_method']) && $filters['payment_method'] !== 'all') {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    /**
     * Helper: Generate next unique sequential Order Number (e.g. ORD-20261021-1001)
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD-' . date('Ymd') . '-';
        $latest = static::where('order_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if ($latest) {
            $lastSequence = (int) substr($latest->order_number, -4);
            $nextSequence = str_pad((string) ($lastSequence + 1), 4, '0', STR_PAD_LEFT);
        } else {
            $nextSequence = '1001';
        }

        return $prefix . $nextSequence;
    }
}
