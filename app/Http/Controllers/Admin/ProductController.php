<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\Catalog\CategoryService;
use App\Services\Catalog\ProductService;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService,
        protected CategoryService $categoryService,
        protected SettingService $settingService
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

        $categories = $this->categoryService->getParentDropdownOptions();
        $brands = Brand::query()->orderBy('name')->get(['id', 'name']);

        $stats = [
            'total' => Product::count(),
            'active_count' => Product::where('is_active', true)->count(),
            'inactive_count' => Product::where('is_active', false)->count(),
            'low_stock_count' => Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count(),
            'out_of_stock_count' => Product::where('stock_quantity', '<=', 0)->count(),
            'featured_count' => Product::where('is_featured', true)->count(),
        ];

        $currentOfferProductId = (int) $this->settingService->get('popup_product_id');
        $popupEnabled = filter_var($this->settingService->get('popup_enabled'), FILTER_VALIDATE_BOOLEAN);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'stats' => $stats,
            'currentOfferProductId' => $currentOfferProductId,
            'popupEnabled' => $popupEnabled,
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
        $categories = $this->categoryService->getParentDropdownOptions();
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
        $product->load(['category', 'brand', 'primaryImage', 'images', 'variants']);
        $categories = $this->categoryService->getParentDropdownOptions();
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
     * Set a product as the active promotional offer popup item with its discounted price.
     */
    public function setOffer(Request $request, Product|string|null $product = null): RedirectResponse
    {
        if (!($product instanceof Product)) {
            $productId = $request->input('product_id') ?? $request->input('id') ?? ($product !== 'set-offer' ? $product : null) ?? $request->route('product');
            $product = $productId ? Product::find($productId) : null;
        }

        if (!$product) {
            return redirect()->back()->with('error', 'Product not found or not specified.');
        }

        $validated = $request->validate([
            'discounted_price' => ['required', 'numeric', 'min:0.01', 'lt:' . $product->base_price],
            'badge_text' => ['nullable', 'string', 'max:100'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'activate_popup' => ['nullable', 'boolean'],
        ], [
            'discounted_price.lt' => 'Discounted offer price must be less than regular base price (৳' . number_format($product->base_price, 2) . ').',
            'discounted_price.required' => 'Please provide the discounted offer price.',
        ]);

        $product->update([
            'sale_price' => $validated['discounted_price'],
        ]);
        $this->productService->flushCache();

        $this->settingService->set('popup_product_id', $product->id, 'popup', 'integer');
        $this->settingService->set('popup_enabled', $request->boolean('activate_popup', true), 'popup', 'boolean');

        if (!empty($validated['badge_text'])) {
            $this->settingService->set('popup_badge_text', $validated['badge_text'], 'popup');
        }

        if (array_key_exists('coupon_code', $validated)) {
            $this->settingService->set('popup_coupon_code', $validated['coupon_code'] ?? '', 'popup');
        }

        return redirect()->back()->with(
            'success',
            "Product '{$product->name}' is now active as the Offer Popup item with discounted price ৳" . number_format($validated['discounted_price'], 2) . '!'
        );
    }

    /**
     * Delete product.
     */
    public function destroy(Request $request, Product|string|null $product = null): RedirectResponse
    {
        if (!($product instanceof Product)) {
            $productId = $request->input('id') ?? ($product !== 'destroy' ? $product : null) ?? $request->route('product');
            $product = $productId ? Product::find($productId) : null;
        }

        if (!$product) {
            return redirect()->back()->with('error', 'Product not found or already removed.');
        }

        $name = $product->name;
        $this->productService->deleteProduct($product);

        return redirect()->back()->with('success', "Product '{$name}' deleted successfully.");
    }
}
