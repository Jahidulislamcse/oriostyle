<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\Procurement\PurchaseOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(
        protected PurchaseOrderService $purchaseOrderService
    ) {}

    /**
     * Display listing of purchase orders with metrics and filters.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'supplier_id', 'from_date', 'to_date']);
        $purchaseOrders = $this->purchaseOrderService->listPurchaseOrders($filters, 15);
        $metrics = $this->purchaseOrderService->getMetrics();
        $suppliers = Supplier::query()->active()->orderBy('name')->select('id', 'name', 'company_name')->get();

        return Inertia::render('Admin/PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
            'metrics' => $metrics,
            'filters' => $filters,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Show form to create a new purchase order.
     */
    public function create(): Response
    {
        $suppliers = Supplier::query()->active()->orderBy('name')->get();
        $products = Product::query()
            ->active()
            ->with(['variants' => fn($q) => $q->where('is_active', true)])
            ->select('id', 'name', 'sku', 'cost_price', 'stock_quantity')
            ->orderBy('name')
            ->get();

        $suggestedPoNumber = $this->purchaseOrderService->generatePoNumber();

        return Inertia::render('Admin/PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
            'suggestedPoNumber' => $suggestedPoNumber,
            'purchaseOrder' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created purchase order.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'po_number' => 'nullable|string|unique:purchase_orders,po_number|max:50',
            'supplier_id' => 'required|exists:suppliers,id',
            'status' => 'nullable|in:draft,ordered',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'shipping_cost' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        $po = $this->purchaseOrderService->createPurchaseOrder($validated, $request->user()?->id);

        return redirect()->route('admin.purchase-orders.show', $po->id)
            ->with('success', "Purchase Order {$po->po_number} created successfully.");
    }

    /**
     * Display detailed purchase order view with items and receiving controls.
     */
    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load([
            'supplier',
            'creator:id,name,email',
            'receiver:id,name,email',
            'items.product:id,name,sku,cost_price,stock_quantity',
            'items.variant:id,sku,size,color,stock_quantity',
        ]);

        return Inertia::render('Admin/PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    /**
     * Show form to edit an existing draft purchase order.
     */
    public function edit(PurchaseOrder $purchaseOrder): Response|RedirectResponse
    {
        if (!$purchaseOrder->canBeEdited()) {
            return redirect()->route('admin.purchase-orders.show', $purchaseOrder->id)
                ->with('error', 'Only draft purchase orders can be edited.');
        }

        $purchaseOrder->load(['items.product', 'items.variant']);
        $suppliers = Supplier::query()->active()->orderBy('name')->get();
        $products = Product::query()
            ->active()
            ->with(['variants' => fn($q) => $q->where('is_active', true)])
            ->select('id', 'name', 'sku', 'cost_price', 'stock_quantity')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
            'purchaseOrder' => $purchaseOrder,
            'suggestedPoNumber' => $purchaseOrder->po_number,
            'isEdit' => true,
        ]);
    }

    /**
     * Update an existing draft purchase order.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'shipping_cost' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        $this->purchaseOrderService->updatePurchaseOrder($purchaseOrder, $validated);

        return redirect()->route('admin.purchase-orders.show', $purchaseOrder->id)
            ->with('success', "Purchase Order {$purchaseOrder->po_number} updated successfully.");
    }

    /**
     * Mark a draft PO as ordered (sent to vendor).
     */
    public function markOrdered(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->purchaseOrderService->markAsOrdered($purchaseOrder);

        return redirect()->back()->with('success', "Purchase Order {$purchaseOrder->po_number} marked as Ordered.");
    }

    /**
     * Receive purchase order: Hydrates stock, updates COGS, and records ledger bill.
     */
    public function receive(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $receivedDate = $request->input('received_date', now()->toDateString());
        $this->purchaseOrderService->receivePurchaseOrder($purchaseOrder, $request->user()?->id, $receivedDate);

        return redirect()->back()->with('success', "Purchase Order {$purchaseOrder->po_number} received! Product stock hydrated and supplier ledger posted.");
    }

    /**
     * Cancel a purchase order.
     */
    public function cancel(Request $request, PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $reason = $request->input('reason');
        $this->purchaseOrderService->cancelPurchaseOrder($purchaseOrder, $reason);

        return redirect()->back()->with('success', "Purchase Order {$purchaseOrder->po_number} has been cancelled.");
    }

    /**
     * Delete a purchase order.
     */
    public function destroy(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        $this->purchaseOrderService->deletePurchaseOrder($purchaseOrder);

        return redirect()->route('admin.purchase-orders.index')
            ->with('success', "Purchase Order {$purchaseOrder->po_number} removed successfully.");
    }
}
