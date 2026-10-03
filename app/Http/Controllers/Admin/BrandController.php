<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Services\Catalog\BrandService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService
    ) {}

    /**
     * Display brands catalog page.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status', 'all');

        $brands = $this->brandService->getAdminBrandsList($search, $status);

        $stats = [
            'total' => Brand::count(),
            'active_count' => Brand::where('is_active', true)->count(),
            'inactive_count' => Brand::where('is_active', false)->count(),
            'featured_count' => Brand::where('is_featured', true)->count(),
        ];

        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store new brand.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands,slug',
            'website_url' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $logoFile = $request->file('logo');
        $this->brandService->createBrand($validated, $logoFile);

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    /**
     * Update brand details.
     */
    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:brands,slug,' . $brand->id,
            'website_url' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            'remove_logo' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $logoFile = $request->file('logo');
        $removeLogo = $request->boolean('remove_logo');

        $this->brandService->updateBrand($brand, $validated, $logoFile, $removeLogo);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Brand $brand): RedirectResponse
    {
        $brand->update(['is_active' => !$brand->is_active]);
        $this->brandService->flushCache();

        return redirect()->back()->with('success', "Brand '{$brand->name}' active status updated.");
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Brand $brand): RedirectResponse
    {
        $brand->update(['is_featured' => !$brand->is_featured]);
        $this->brandService->flushCache();

        return redirect()->back()->with('success', "Brand '{$brand->name}' featured status updated.");
    }

    /**
     * Delete brand.
     */
    public function destroy(Request $request, Brand|string|null $brand = null): RedirectResponse
    {
        if (!($brand instanceof Brand)) {
            $brandId = $request->input('id') ?? ($brand !== 'destroy' ? $brand : null) ?? $request->route('brand');
            $brand = $brandId ? Brand::find($brandId) : null;
        }

        if (!$brand) {
            return redirect()->back()->with('error', 'Brand not found or already removed.');
        }

        $name = $brand->name;
        $this->brandService->deleteBrand($brand);

        return redirect()->back()->with('success', "Brand '{$name}' deleted successfully.");
    }
}
