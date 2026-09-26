<?php

namespace App\Services\Catalog;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
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
            ->with(['parent:id,name,slug'])
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
                ->orderBy('display_order')
                ->orderBy('name')
                ->with(['children' => function ($q) {
                    $q->active()
                      ->orderBy('display_order')
                      ->orderBy('name')
                      ->with(['children' => function ($subQuery) {
                          $subQuery->active()->orderBy('display_order')->orderBy('name');
                      }]);
                }])
                ->get();
        });
    }

    /**
     * Get parent options formatted for dropdown selector, excluding invalid circular parents.
     *
     * @param int|null $excludeCategoryId
     * @return array<array{id: int, name: string, path: string, depth: int}>
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
     * Create a new category record with auto-slug generation.
     */
    public function createCategory(array $data): Category
    {
        $data['slug'] = $this->generateUniqueSlug($data['slug'] ?? $data['name']);
        $data['display_order'] = $data['display_order'] ?? 0;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_featured'] = $data['is_featured'] ?? false;

        $category = Category::create($data);
        $this->clearCategoryCache();

        return $category;
    }

    /**
     * Update an existing category with circular parent validation.
     *
     * @throws InvalidArgumentException
     */
    public function updateCategory(Category $category, array $data): Category
    {
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

        $category->update($data);
        $this->clearCategoryCache();

        return $category;
    }

    /**
     * Safely delete a category and re-parent direct children.
     */
    public function deleteCategory(Category $category): bool
    {
        // Shift direct children to parent of deleted category (or root if null)
        Category::where('parent_id', $category->id)->update([
            'parent_id' => $category->parent_id,
        ]);

        $deleted = $category->delete();
        $this->clearCategoryCache();

        return (bool) $deleted;
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
