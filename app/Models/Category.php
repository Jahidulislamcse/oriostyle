<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;

class Category extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'image',
        'icon',
        'description',
        'discount',
        'display_order',
        'is_active',
        'is_featured',
        'meta_title',
        'meta_description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Self-Referencing Eloquent Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Direct parent category relationship.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Direct child subcategories relationship.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')
            ->orderBy('display_order')
            ->orderBy('name');
    }

    /**
     * Deep recursive subcategories relationship.
     */
    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    /**
     * Products belonging to this category.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    /**
     * Gallery images belonging to this category (max 3).
     */
    public function images(): HasMany
    {
        return $this->hasMany(CategoryImage::class, 'category_id')
            ->orderBy('display_order')
            ->orderBy('id');
    }

    /**
     * Featured hero image for this category (prioritizes is_featured = true, falls back to display_order).
     */
    public function featuredImage(): HasOne
    {
        return $this->hasOne(CategoryImage::class, 'category_id')
            ->orderByDesc('is_featured')
            ->orderBy('display_order');
    }

    /*
    |--------------------------------------------------------------------------
    | Query Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include featured categories.
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include root/top-level categories.
     */
    public function scopeRoot(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope a query to only include subcategories.
     */
    public function scopeSubcategory(Builder $query): Builder
    {
        return $query->whereNotNull('parent_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Hierarchy Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Retrieve a flat collection of all descendant IDs recursively.
     *
     * @return array<int>
     */
    public function getAllDescendantIds(): array
    {
        $ids = [];

        // Eager-loaded children traversal to prevent N+1 queries
        if ($this->relationLoaded('allChildren')) {
            $traverse = function ($category) use (&$traverse, &$ids) {
                foreach ($category->allChildren as $child) {
                    $ids[] = $child->id;
                    $traverse($child);
                }
            };
            $traverse($this);
            return $ids;
        }

        // Direct DB query fallback
        $directChildren = self::where('parent_id', $this->id)->get();
        foreach ($directChildren as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $child->getAllDescendantIds());
        }

        return array_unique($ids);
    }

    /**
     * Get array of all ancestor models from root down to this category.
     *
     * @return Collection<int, Category>
     */
    public function getAncestors(): Collection
    {
        $ancestors = collect();
        $current = $this->parent;

        while ($current !== null) {
            $ancestors->prepend($current);
            $current = $current->parent;
        }

        return $ancestors;
    }

    /**
     * Get breadcrumb path string (e.g. "Fashion > Men > Shirts").
     */
    public function getHierarchyPath(): string
    {
        $names = $this->getAncestors()->pluck('name')->push($this->name);
        return $names->implode(' > ');
    }
}
