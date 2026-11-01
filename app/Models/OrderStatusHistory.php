<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'order_status_histories';

    protected $fillable = [
        'order_id',
        'user_id',
        'from_status',
        'to_status',
        'action',
        'comment',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Relationship: Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * Relationship: User (admin or staff who executed the action)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
