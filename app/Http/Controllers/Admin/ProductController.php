<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\Catalog\ProductService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * Display product catalog list page.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category', 'all');
        $brand = $request->query('brand', 'all');
        $status = $request->query('status', 'all');

        $products = $this->productService->getAdminProductsList($search, $category, $brand, $status, 12);

        $categories = Category::query()->orderBy('name')->get(['id', 'name', 'parent_id']);
        $brands = Brand::query()->orderBy('name')->get(['id', 'name']);

        $stats = [
            'total' => Product::count(),
            'active_count' => Product::where('is_active', true)->count(),
            'inactive_count' => Product::where('is_active', false)->count(),
            'low_stock_count' => Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count(),
            'out_of_stock_count' => Product::where('stock_quantity', '<=', 0)->count(),
            'featured_count' => Product::where('is_featured', true)->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category,
                'brand' => $brand,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show create product form.
     */
    public function create(): Response
    {
        $categories = Category::query()->orderBy('name')->get(['id', 'name', 'parent_id']);
        $brands = Brand::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Store new product.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'is_new_arrival' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:3072',
            'variants' => 'nullable|array',
            'variants.*.size' => 'nullable|string|max:50',
            'variants.*.color' => 'nullable|string|max:50',
            'variants.*.price_adjustment' => 'nullable|numeric',
            'variants.*.stock_quantity' => 'nullable|integer|min:0',
        ]);

        $images = $request->file('images', []);
        $variants = $request->input('variants', []);

        $this->productService->createProduct($validated, $images, $variants);

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Show edit product form.
     */
    public function edit(Product $product): Response
    {
        $product->load(['category', 'brand', 'images', 'variants']);
        $categories = Category::query()->orderBy('name')->get(['id', 'name', 'parent_id']);
        $brands = Brand::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Form', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    /**
     * Update product details.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug,' . $product->id,
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'is_new_arrival' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:3072',
            'variants' => 'nullable|array',
        ]);

        $images = $request->file('images', []);
        $variants = $request->input('variants', []);

        $this->productService->updateProduct($product, $validated, $images, $variants);

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Quick stock adjustment.
     */
    public function updateStock(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $this->productService->updateStock($product, (int) $request->input('stock_quantity'));

        return redirect()->back()->with('success', "Stock for '{$product->name}' updated to {$product->stock_quantity}.");
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Product $product): RedirectResponse
    {
        $product->update(['is_active' => !$product->is_active]);
        $this->productService->flushCache();

        return redirect()->back()->with('success', "Product '{$product->name}' active status updated.");
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Product $product): RedirectResponse
    {
        $product->update(['is_featured' => !$product->is_featured]);
        $this->productService->flushCache();

        return redirect()->back()->with('success', "Product '{$product->name}' featured status updated.");
    }

    /**
     * Delete product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $this->productService->deleteProduct($product);

        return redirect()->back()->with('success', "Product '{$name}' deleted successfully.");
    }
}
