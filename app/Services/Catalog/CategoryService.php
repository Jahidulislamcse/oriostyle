<?php

namespace App\Services\Catalog;

use App\Models\Category;
use App\Models\CategoryImage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CategoryService
{
    public const CACHE_STOREFRONT_TREE_KEY = 'storefront:category_tree';
    public const CACHE_TTL_SECONDS = 86400; // 24 Hours

    /**
     * Get category tree structured for admin management with eager loading.
     *
     * @return Collection<int, Category>
     */
    public function getAdminCategoriesList(?string $search = null, ?string $status = null, ?string $parentFilter = null)
    {
        $query = Category::query()
            ->with(['parent:id,name,slug', 'images', 'featuredImage'])
            ->withCount('children')
            ->orderBy('parent_id')
            ->orderBy('display_order')
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($parentFilter === 'root') {
            $query->whereNull('parent_id');
        } elseif ($parentFilter === 'sub') {
            $query->whereNotNull('parent_id');
        } elseif (is_numeric($parentFilter)) {
            $query->where('parent_id', (int) $parentFilter);
        }

        return $query->get();
    }

    /**
     * Get hierarchical tree of root categories with nested active children for storefront.
     */
    public function getStorefrontNavTree(): Collection
    {
        return Cache::remember(self::CACHE_STOREFRONT_TREE_KEY, self::CACHE_TTL_SECONDS, function () {
            return Category::query()
                ->root()
                ->active()
                ->with(['images', 'featuredImage'])
                ->orderBy('display_order')
                ->orderBy('name')
                ->with(['children' => function ($q) {
                    $q->active()
                      ->with(['images', 'featuredImage'])
                      ->orderBy('display_order')
                      ->orderBy('name')
                      ->with(['children' => function ($subQuery) {
                          $subQuery->active()->with(['images', 'featuredImage'])->orderBy('display_order')->orderBy('name');
                      }]);
                }])
                ->get();
        });
    }

    /**
     * Get parent options formatted for dropdown selector, excluding invalid circular parents.
     *
     * @param int|null $excludeCategoryId
     * @return array<array{id: int, name: string, label: string, path: string, depth: int}>
     */
    public function getParentDropdownOptions(?int $excludeCategoryId = null): array
    {
        $allCategories = Category::query()
            ->select('id', 'parent_id', 'name', 'slug', 'display_order')
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        $excludedIds = [];
        if ($excludeCategoryId) {
            $excludedIds[] = $excludeCategoryId;
            $categoryToExclude = $allCategories->firstWhere('id', $excludeCategoryId);
            if ($categoryToExclude) {
                $excludedIds = array_merge($excludedIds, $categoryToExclude->getAllDescendantIds());
            }
        }

        // Build hierarchical options array with indented prefix
        $options = [];
        $buildTree = function ($parentId = null, $depth = 0, $prefix = '') use (&$buildTree, &$options, $allCategories, $excludedIds) {
            $children = $allCategories->where('parent_id', $parentId);

            foreach ($children as $cat) {
                if (in_array($cat->id, $excludedIds, true)) {
                    continue;
                }

                $path = $prefix ? "{$prefix} > {$cat->name}" : $cat->name;
                $indent = str_repeat('— ', $depth);

                $options[] = [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'label' => "{$indent}{$cat->name}",
                    'path' => $path,
                    'depth' => $depth,
                ];

                $buildTree($cat->id, $depth + 1, $path);
            }
        };

        $buildTree(null, 0, '');

        return $options;
    }

    /**
     * Create a new category record with auto-slug generation and up to 3 images.
     */
    public function createCategory(array $data, array $images = [], ?int $featuredIndex = null): Category
    {
        return DB::transaction(function () use ($data, $images, $featuredIndex) {
            if (empty($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['name']);
            } else {
                $data['slug'] = $this->generateUniqueSlug($data['slug']);
            }

            $data['display_order'] = $data['display_order'] ?? 0;
            $data['is_active'] = $data['is_active'] ?? true;
            $data['is_featured'] = $data['is_featured'] ?? false;

            // Extract file images from data if not passed separately
            if (empty($images) && !empty($data['images']) && is_array($data['images'])) {
                $images = $data['images'];
            }
            if ($featuredIndex === null && isset($data['featured_image_index'])) {
                $featuredIndex = is_numeric($data['featured_image_index']) ? (int) $data['featured_image_index'] : null;
            }

            $categoryData = array_diff_key($data, array_flip(['images', 'featured_image_index', 'featured_image_id', 'deleted_image_ids']));
            $category = Category::create($categoryData);

            // Handle images (max 3)
            if (!empty($images)) {
                $this->storeCategoryImages($category, $images, $featuredIndex);
            }

            $this->clearCategoryCache();
            return $category;
        });
    }

    /**
     * Update an existing category with circular parent validation and image sync.
     *
     * @throws InvalidArgumentException
     */
    public function updateCategory(
        Category $category,
        array $data,
        array $images = [],
        ?int $featuredIndex = null,
        array $deletedImageIds = [],
        ?int $featuredImageId = null
    ): Category {
        return DB::transaction(function () use ($category, $data, $images, $featuredIndex, $deletedImageIds, $featuredImageId) {
            // Prevent assigning category as child of itself or its descendants
            if (isset($data['parent_id']) && $data['parent_id'] !== null) {
                $newParentId = (int) $data['parent_id'];
                if ($newParentId === $category->id) {
                    throw new InvalidArgumentException('A category cannot be set as its own parent.');
                }

                $descendantIds = $category->getAllDescendantIds();
                if (in_array($newParentId, $descendantIds, true)) {
                    throw new InvalidArgumentException('A category cannot be assigned to one of its subcategories.');
                }
            }

            if (isset($data['slug']) && $data['slug'] !== $category->slug) {
                $data['slug'] = $this->generateUniqueSlug($data['slug'], $category->id);
            } elseif (empty($data['slug']) && isset($data['name']) && $data['name'] !== $category->name) {
                $data['slug'] = $this->generateUniqueSlug($data['name'], $category->id);
            }

            // Extract values from $data if passed directly
            if (empty($images) && !empty($data['images']) && is_array($data['images'])) {
                $images = $data['images'];
            }
            if ($featuredIndex === null && isset($data['featured_image_index']) && is_numeric($data['featured_image_index'])) {
                $featuredIndex = (int) $data['featured_image_index'];
            }
            if ($featuredImageId === null && isset($data['featured_image_id']) && is_numeric($data['featured_image_id'])) {
                $featuredImageId = (int) $data['featured_image_id'];
            }
            if (empty($deletedImageIds) && !empty($data['deleted_image_ids']) && is_array($data['deleted_image_ids'])) {
                $deletedImageIds = $data['deleted_image_ids'];
            }

            $categoryData = array_diff_key($data, array_flip(['images', 'featured_image_index', 'featured_image_id', 'deleted_image_ids']));
            $category->update($categoryData);

            // 1. Delete requested images
            if (!empty($deletedImageIds)) {
                $imagesToDelete = CategoryImage::where('category_id', $category->id)
                    ->whereIn('id', $deletedImageIds)
                    ->get();

                foreach ($imagesToDelete as $img) {
                    $this->deleteImageFile($img->image_path);
                    $img->delete();
                }
            }

            // 2. Count existing images
            $existingCount = CategoryImage::where('category_id', $category->id)->count();
            $maxAllowedNew = max(0, 3 - $existingCount);

            // 3. Upload new images if under max 3 limit
            $newSavedImages = [];
            if (!empty($images) && $maxAllowedNew > 0) {
                $imagesToUpload = array_slice($images, 0, $maxAllowedNew);
                $orderOffset = $existingCount;

                foreach ($imagesToUpload as $idx => $imgItem) {
                    if ($imgItem instanceof UploadedFile) {
                        $path = $imgItem->store('categories', 'public');
                        $url = Storage::disk('public')->url($path);

                        $newImg = CategoryImage::create([
                            'category_id' => $category->id,
                            'image_path' => $url,
                            'is_featured' => false,
                            'display_order' => $orderOffset + $idx,
                        ]);
                        $newSavedImages[] = $newImg;
                    }
                }
            }

            // 4. Update Featured Image selection
            if ($featuredImageId !== null && $featuredImageId > 0) {
                CategoryImage::where('category_id', $category->id)->update(['is_featured' => false]);
                CategoryImage::where('category_id', $category->id)->where('id', $featuredImageId)->update(['is_featured' => true]);
            } elseif ($featuredIndex !== null && isset($newSavedImages[$featuredIndex])) {
                CategoryImage::where('category_id', $category->id)->update(['is_featured' => false]);
                $newSavedImages[$featuredIndex]->update(['is_featured' => true]);
            }

            // Ensure at least one image is featured if images exist
            $hasFeatured = CategoryImage::where('category_id', $category->id)->where('is_featured', true)->exists();
            if (!$hasFeatured) {
                $firstImg = CategoryImage::where('category_id', $category->id)->orderBy('display_order')->first();
                if ($firstImg) {
                    $firstImg->update(['is_featured' => true]);
                }
            }

            $this->clearCategoryCache();
            return $category;
        });
    }

    /**
     * Store up to 3 images for a category.
     */
    protected function storeCategoryImages(Category $category, array $images, ?int $featuredIndex = null): void
    {
        $imagesToUpload = array_slice($images, 0, 3);
        $saved = [];

        foreach ($imagesToUpload as $idx => $imgItem) {
            if ($imgItem instanceof UploadedFile) {
                $path = $imgItem->store('categories', 'public');
                $url = Storage::disk('public')->url($path);

                $isFeatured = ($featuredIndex !== null) ? ($idx === $featuredIndex) : ($idx === 0);

                $saved[] = CategoryImage::create([
                    'category_id' => $category->id,
                    'image_path' => $url,
                    'is_featured' => $isFeatured,
                    'display_order' => $idx,
                ]);
            }
        }

        // If none marked as featured and images exist, mark first as featured
        if (!empty($saved) && !collect($saved)->contains('is_featured', true)) {
            $saved[0]->update(['is_featured' => true]);
        }
    }

    /**
     * Delete an image file from storage disk.
     */
    protected function deleteImageFile(string $imagePath): void
    {
        $relativePath = Str::after($imagePath, '/storage/');
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }

    /**
     * Safely delete a category and clean up image files.
     */
    public function deleteCategory(Category $category): bool
    {
        return DB::transaction(function () use ($category) {
            // Delete all associated category images from storage
            $images = CategoryImage::where('category_id', $category->id)->get();
            foreach ($images as $img) {
                $this->deleteImageFile($img->image_path);
            }

            // Shift direct children to parent of deleted category (or root if null)
            Category::where('parent_id', $category->id)->update([
                'parent_id' => $category->parent_id,
            ]);

            $deleted = $category->delete();
            $this->clearCategoryCache();

            return (bool) $deleted;
        });
    }

    /**
     * Toggle active state.
     */
    public function toggleActive(Category $category): Category
    {
        $category->update(['is_active' => !$category->is_active]);
        $this->clearCategoryCache();
        return $category;
    }

    /**
     * Toggle featured state.
     */
    public function toggleFeatured(Category $category): Category
    {
        $category->update(['is_featured' => !$category->is_featured]);
        $this->clearCategoryCache();
        return $category;
    }

    /**
     * Generate unique URL-friendly slug.
     */
    protected function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($title);
        if (empty($baseSlug)) {
            $baseSlug = 'category-' . Str::random(6);
        }

        $slug = $baseSlug;
        $counter = 1;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if slug already exists.
     */
    protected function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $query = Category::where('slug', $slug);
        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }
        return $query->exists();
    }

    /**
     * Invalidate category cache tags / keys.
     */
    public function clearCategoryCache(): void
    {
        Cache::forget(self::CACHE_STOREFRONT_TREE_KEY);
    }
}
