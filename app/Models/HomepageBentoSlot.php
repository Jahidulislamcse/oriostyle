<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageBentoSlot extends Model
{
    use HasFactory;

    protected $table = 'homepage_bento_slots';

    protected $fillable = [
        'slot_key',
        'category_id',
        'title',
        'subtitle',
        'image_path',
        'aspect_ratio',
        'recommended_dimensions',
        'has_arrow',
        'dark_badge',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'has_arrow' => 'boolean',
        'dark_badge' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
        'display_title',
        'category_slug',
    ];

    /**
     * Relationship: Associated Category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Accessor: Clean Image URL for frontend display
     */
    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image_path)) {
            return null;
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://') || str_starts_with($this->image_path, '/')) {
            return $this->image_path;
        }

        return '/storage/' . ltrim($this->image_path, '/');
    }

    /**
     * Accessor: Display Title (falls back to category name)
     */
    public function getDisplayTitleAttribute(): string
    {
        if (!empty($this->title)) {
            return $this->title;
        }

        if ($this->relationLoaded('category') && $this->category) {
            return $this->category->name;
        }

        return $this->category?->name ?? 'Featured Collection';
    }

    /**
     * Accessor: Category Slug
     */
    public function getCategorySlugAttribute(): string
    {
        if ($this->relationLoaded('category') && $this->category) {
            return $this->category->slug ?? '';
        }

        return $this->category?->slug ?? '';
    }

    /**
     * Scope: Active slots
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('display_order');
    }
}
