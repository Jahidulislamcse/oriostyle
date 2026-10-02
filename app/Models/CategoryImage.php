<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryImage extends Model
{
    use HasFactory;

    protected $table = 'category_images';

    protected $fillable = [
        'category_id',
        'image_path',
        'is_featured',
        'display_order',
    ];

    protected $appends = [
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    /**
     * Accessor for full public image URL.
     */
    public function getImageUrlAttribute(): string
    {
        if (empty($this->image_path)) {
            return '';
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return asset('storage/' . ltrim($this->image_path, '/'));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
