<?php

namespace App\Models;

use App\Support\UrlSanitizer;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    use HasFactory;

    protected $table = 'product_images';

    protected $fillable = [
        'product_id',
        'image_path',
        'is_primary',
        'display_order',
    ];

    protected $appends = [
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    /**
     * Clean raw stored image path so legacy localhost prefixes never leak.
     */
    public function getImagePathAttribute(?string $value): ?string
    {
        return UrlSanitizer::cleanRawPath($value);
    }

    /**
     * Accessor for full public image URL safely sanitized against localhost loopbacks.
     */
    public function getImageUrlAttribute(): string
    {
        return UrlSanitizer::sanitize($this->image_path) ?? '';
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
