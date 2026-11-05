<?php

namespace App\Models;

use App\Support\UrlSanitizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banners';

    protected $fillable = [
        'title',
        'subtitle',
        'badge_text',
        'button_text',
        'link_url',
        'image_path',
        'mobile_image_path',
        'type',
        'display_order',
        'is_active',
    ];

    protected $appends = [
        'image_url',
        'mobile_image_url',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Clean raw stored image path.
     */
    public function getImagePathAttribute(?string $value): ?string
    {
        return UrlSanitizer::cleanRawPath($value);
    }

    /**
     * Clean raw stored mobile image path.
     */
    public function getMobileImagePathAttribute(?string $value): ?string
    {
        return UrlSanitizer::cleanRawPath($value);
    }

    /**
     * Accessor: Get full public image URL safely sanitized against localhost loopbacks.
     */
    public function getImageUrlAttribute(): ?string
    {
        return UrlSanitizer::sanitize($this->image_path);
    }

    /**
     * Accessor: Get dedicated mobile banner image URL safely sanitized against localhost loopbacks.
     */
    public function getMobileImageUrlAttribute(): ?string
    {
        return UrlSanitizer::sanitize($this->mobile_image_path);
    }

    /**
     * Scope: Only active banners.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filter by banner type (hero, split, promo).
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Order by display_order ascending, then id ascending.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order', 'asc')->orderBy('id', 'asc');
    }
}
