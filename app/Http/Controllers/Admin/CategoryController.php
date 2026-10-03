<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryStoreRequest;
use App\Http\Requests\Admin\CategoryUpdateRequest;
use App\Models\Category;
use App\Services\Catalog\CategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of the categories with hierarchy and filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $parentFilter = $request->input('parent');

        $categories = $this->categoryService->getAdminCategoriesList($search, $status, $parentFilter);
        $parentOptions = $this->categoryService->getParentDropdownOptions();

        // Calculate taxonomy summary metrics
        $allCategories = Category::all(['id', 'parent_id', 'is_active', 'is_featured']);
        $stats = [
            'total' => $allCategories->count(),
            'root_count' => $allCategories->whereNull('parent_id')->count(),
            'sub_count' => $allCategories->whereNotNull('parent_id')->count(),
            'active_count' => $allCategories->where('is_active', true)->count(),
            'featured_count' => $allCategories->where('is_featured', true)->count(),
        ];

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'parentOptions' => $parentOptions,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'parent' => $parentFilter ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(CategoryStoreRequest $request): RedirectResponse
    {
        $images = $request->file('images', []);
        $featuredIndex = $request->input('featured_image_index');

        $category = $this->categoryService->createCategory(
            $request->validated(),
            $images,
            $featuredIndex !== null ? (int) $featuredIndex : null
        );

        return redirect()->back()->with('success', "Category '{$category->name}' created successfully.");
    }

    /**
     * Update the specified category in storage.
     */
    public function update(CategoryUpdateRequest $request, Category $category): RedirectResponse
    {
        try {
            $images = $request->file('images', []);
            $featuredIndex = $request->input('featured_image_index');
            $deletedImageIds = $request->input('deleted_image_ids', []);
            $featuredImageId = $request->input('featured_image_id');

            $this->categoryService->updateCategory(
                $category,
                $request->validated(),
                $images,
                $featuredIndex !== null ? (int) $featuredIndex : null,
                is_array($deletedImageIds) ? $deletedImageIds : [],
                $featuredImageId !== null ? (int) $featuredImageId : null
            );

            return redirect()->back()->with('success', "Category '{$category->name}' updated successfully.");
        } catch (InvalidArgumentException $e) {
            return redirect()->back()->withErrors(['parent_id' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Request $request, Category|string|null $category = null): RedirectResponse
    {
        if (!($category instanceof Category)) {
            $categoryId = $request->input('id') ?? ($category !== 'destroy' ? $category : null) ?? $request->route('category');
            $category = $categoryId ? Category::find($categoryId) : null;
        }

        if (!$category) {
            return redirect()->back()->with('error', 'Category not found or already removed.');
        }

        $name = $category->name;
        $this->categoryService->deleteCategory($category);

        return redirect()->back()->with('success', "Category '{$name}' deleted successfully. Any subcategories have been preserved.");
    }

    /**
     * Toggle the active status of the specified category.
     */
    public function toggleActive(Category $category): RedirectResponse
    {
        $this->categoryService->toggleActive($category);
        $statusText = $category->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Category '{$category->name}' has been {$statusText}.");
    }

    /**
     * Toggle the featured status of the specified category.
     */
    public function toggleFeatured(Category $category): RedirectResponse
    {
        $this->categoryService->toggleFeatured($category);
        $featuredText = $category->is_featured ? 'marked as featured' : 'unmarked from featured';

        return redirect()->back()->with('success', "Category '{$category->name}' is now {$featuredText}.");
    }
}
