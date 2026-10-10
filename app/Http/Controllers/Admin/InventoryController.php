<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * Display inventory dashboard with stock summary, movement ledger, and damage logs.
     */
    public function index(Request $request): Response
    {
        $metrics = $this->inventoryService->getMetrics();
        $stockSummary = $this->inventoryService->getStockSummary(
            $request->only(['search', 'stock_status', 'category_id']),
            15
        );
        $ledger = $this->inventoryService->getInventoryLedger(
            $request->only(['search', 'type', 'product_id']),
            15
        );
        $damageLogs = $this->inventoryService->getDamageLogs(
            $request->only(['search', 'reason']),
            15
        );

        $categories = Category::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $products = Product::query()
            ->select('id', 'name', 'sku', 'stock_quantity', 'cost_price', 'low_stock_threshold')
            ->with(['variants:id,product_id,sku,size,color,stock_quantity'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Inventory/Index', [
            'metrics' => $metrics,
            'stockSummary' => $stockSummary,
            'ledger' => $ledger,
            'damageLogs' => $damageLogs,
            'categories' => $categories,
            'products' => $products,
            'filters' => $request->only(['search', 'stock_status', 'category_id', 'type', 'active_tab']),
        ]);
    }

    /**
     * Record a manual stock adjustment.
     */
    public function adjust(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'action' => 'required|in:increase,decrease,set_exact',
            'quantity' => 'required|integer|min:0',
            'reason' => 'required|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $movement = $this->inventoryService->recordAdjustment($validated, $request->user()?->id);

        return redirect()->back()->with('success', "Stock adjustment completed successfully (Movement #{$movement->id}).");
    }

    /**
     * Log damaged/lost stock write-off.
     */
    public function logDamage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ]);

        $damageLog = $this->inventoryService->recordDamage($validated, $request->user()?->id);

        return redirect()->back()->with('success', "Damage write-off {$damageLog->damage_number} logged successfully.");
    }

    /**
     * Update low stock threshold for a product.
     */
    public function updateThreshold(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'low_stock_threshold' => 'required|integer|min:0|max:100000',
        ]);

        $this->inventoryService->updateLowStockThreshold($product, (int) $validated['low_stock_threshold']);

        return redirect()->back()->with('success', "Low stock threshold for '{$product->name}' updated to {$validated['low_stock_threshold']} units.");
    }
}
