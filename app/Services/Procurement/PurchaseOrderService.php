<?php

namespace App\Services\Procurement;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Services\SupplyChain\SupplierService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PurchaseOrderService
{
    public function __construct(
        protected SupplierService $supplierService
    ) {}

    /**
     * Generate sequential purchase order number: PO-YYYY-XXXX.
     */
    public function generatePoNumber(): string
    {
        $year = date('Y');
        $prefix = "PO-{$year}-";

        $lastPo = PurchaseOrder::where('po_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if ($lastPo) {
            $lastNumber = (int) substr($lastPo->po_number, strlen($prefix));
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        return "{$prefix}{$nextNumber}";
    }

    /**
     * List purchase orders with anti-N+1 eager loading and flexible filtering.
     */
    public function listPurchaseOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = PurchaseOrder::query()
            ->with([
                'supplier:id,name,company_name,phone',
                'creator:id,name',
                'receiver:id,name',
                'items.product:id,name,sku',
                'items.variant:id,sku,size,color',
            ])
            ->orderBy('id', 'desc');

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['supplier_id']) && $filters['supplier_id'] !== 'all') {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('order_date', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('order_date', '<=', $filters['to_date']);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Retrieve aggregate operational metrics for PO dashboard.
     */
    public function getMetrics(): array
    {
        return [
            'total_orders' => PurchaseOrder::count(),
            'pending_orders' => PurchaseOrder::where('status', PurchaseOrder::STATUS_ORDERED)->count(),
            'draft_orders' => PurchaseOrder::where('status', PurchaseOrder::STATUS_DRAFT)->count(),
            'received_orders' => PurchaseOrder::where('status', PurchaseOrder::STATUS_RECEIVED)->count(),
            'total_received_value' => (float) PurchaseOrder::where('status', PurchaseOrder::STATUS_RECEIVED)->sum('total_amount'),
            'total_ordered_value' => (float) PurchaseOrder::where('status', PurchaseOrder::STATUS_ORDERED)->sum('total_amount'),
        ];
    }

    /**
     * Create a new purchase order with line items.
     */
    public function createPurchaseOrder(array $data, ?int $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $userId) {
            $poNumber = !empty($data['po_number']) ? $data['po_number'] : $this->generatePoNumber();

            // Calculate item totals
            $items = $data['items'] ?? [];
            if (empty($items)) {
                throw new InvalidArgumentException('A purchase order must include at least one product line item.');
            }

            $subtotal = 0.00;
            $preparedItems = [];

            foreach ($items as $item) {
                $qty = (int) ($item['quantity_ordered'] ?? 1);
                $unitCost = (float) ($item['unit_cost'] ?? 0);
                $lineSubtotal = round($qty * $unitCost, 2);
                $subtotal += $lineSubtotal;

                $preparedItems[] = [
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity_ordered' => $qty,
                    'quantity_received' => 0,
                    'unit_cost' => $unitCost,
                    'subtotal' => $lineSubtotal,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            $shippingCost = (float) ($data['shipping_cost'] ?? 0);
            $taxAmount = (float) ($data['tax_amount'] ?? 0);
            $discountAmount = (float) ($data['discount_amount'] ?? 0);
            $totalAmount = max(0.00, round($subtotal + $shippingCost + $taxAmount - $discountAmount, 2));

            $po = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'status' => $data['status'] ?? PurchaseOrder::STATUS_DRAFT,
                'order_date' => $data['order_date'] ?? now()->toDateString(),
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            foreach ($preparedItems as $pItem) {
                $po->items()->create($pItem);
            }

            return $po->load(['supplier', 'items.product', 'items.variant']);
        });
    }

    /**
     * Update a draft purchase order.
     */
    public function updatePurchaseOrder(PurchaseOrder $purchaseOrder, array $data): PurchaseOrder
    {
        if (!$purchaseOrder->canBeEdited()) {
            throw new InvalidArgumentException('Only draft purchase orders can be modified.');
        }

        return DB::transaction(function () use ($purchaseOrder, $data) {
            $items = $data['items'] ?? [];
            if (empty($items)) {
                throw new InvalidArgumentException('A purchase order must include at least one product line item.');
            }

            $subtotal = 0.00;
            $preparedItems = [];

            foreach ($items as $item) {
                $qty = (int) ($item['quantity_ordered'] ?? 1);
                $unitCost = (float) ($item['unit_cost'] ?? 0);
                $lineSubtotal = round($qty * $unitCost, 2);
                $subtotal += $lineSubtotal;

                $preparedItems[] = [
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?? null,
                    'quantity_ordered' => $qty,
                    'quantity_received' => 0,
                    'unit_cost' => $unitCost,
                    'subtotal' => $lineSubtotal,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            $shippingCost = (float) ($data['shipping_cost'] ?? 0);
            $taxAmount = (float) ($data['tax_amount'] ?? 0);
            $discountAmount = (float) ($data['discount_amount'] ?? 0);
            $totalAmount = max(0.00, round($subtotal + $shippingCost + $taxAmount - $discountAmount, 2));

            $purchaseOrder->update([
                'supplier_id' => $data['supplier_id'],
                'order_date' => $data['order_date'] ?? $purchaseOrder->order_date,
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'notes' => $data['notes'] ?? null,
            ]);

            // Sync items: remove existing and re-insert
            $purchaseOrder->items()->delete();
            foreach ($preparedItems as $pItem) {
                $purchaseOrder->items()->create($pItem);
            }

            return $purchaseOrder->fresh(['supplier', 'items.product', 'items.variant']);
        });
    }

    /**
     * Mark PO as ordered (sent to vendor).
     */
    public function markAsOrdered(PurchaseOrder $purchaseOrder): PurchaseOrder
    {
        if (!$purchaseOrder->canBeOrdered()) {
            throw new InvalidArgumentException('Only draft purchase orders can be marked as ordered.');
        }

        $purchaseOrder->update(['status' => PurchaseOrder::STATUS_ORDERED]);

        return $purchaseOrder;
    }

    /**
     * Receive purchase order:
     * 1. Hydrates inventory stock for products and variants
     * 2. Recalculates weighted average COGS (Cost of Goods Sold)
     * 3. Posts bill entry to Supplier Ledger and updates payable balance
     */
    public function receivePurchaseOrder(PurchaseOrder $purchaseOrder, ?int $userId = null, ?string $receivedDate = null): PurchaseOrder
    {
        if (!$purchaseOrder->canBeReceived()) {
            throw new InvalidArgumentException("Purchase order {$purchaseOrder->po_number} is already in '{$purchaseOrder->status}' status.");
        }

        return DB::transaction(function () use ($purchaseOrder, $userId, $receivedDate) {
            $effectiveReceivedDate = $receivedDate ?? now()->toDateString();
            $purchaseOrder->loadMissing(['items.product', 'items.variant', 'supplier']);

            foreach ($purchaseOrder->items as $item) {
                $qty = $item->quantity_ordered;
                $unitCost = (float) $item->unit_cost;

                // 1. Update Product inventory and Weighted Moving Average COGS
                $product = $item->product;
                if ($product) {
                    $currentStock = (int) $product->stock_quantity;
                    $currentCost = (float) $product->cost_price;

                    // Weighted average cost formula:
                    // ((current_stock * current_cost) + (new_qty * new_unit_cost)) / (current_stock + new_qty)
                    if ($currentStock > 0 && $currentCost > 0) {
                        $newWeightedCost = (($currentStock * $currentCost) + ($qty * $unitCost)) / ($currentStock + $qty);
                    } else {
                        $newWeightedCost = $unitCost;
                    }

                    $product->cost_price = round($newWeightedCost, 2);
                    $product->stock_quantity = $currentStock + $qty;
                    $product->save();
                }

                // 2. Update Product Variant inventory (if applicable)
                if ($item->product_variant_id && $item->variant) {
                    $variant = $item->variant;
                    $variant->stock_quantity = (int) $variant->stock_quantity + $qty;
                    $variant->save();
                }

                // 3. Mark item received quantity
                $item->update(['quantity_received' => $qty]);
            }

            // 4. Update PO status and receiver metadata
            $purchaseOrder->update([
                'status' => PurchaseOrder::STATUS_RECEIVED,
                'received_date' => $effectiveReceivedDate,
                'received_by' => $userId,
            ]);

            // 5. Post Bill to Supplier Ledger
            if ($purchaseOrder->supplier && (float) $purchaseOrder->total_amount > 0) {
                $this->supplierService->recordTransaction($purchaseOrder->supplier, [
                    'transaction_type' => 'bill',
                    'reference_no' => $purchaseOrder->po_number,
                    'credit' => (float) $purchaseOrder->total_amount,
                    'debit' => 0.00,
                    'transaction_date' => $effectiveReceivedDate,
                    'notes' => "Stock-In Received for PO #{$purchaseOrder->po_number} ({$purchaseOrder->items->count()} line items)",
                ], $userId);
            }

            return $purchaseOrder->fresh(['supplier', 'items.product', 'items.variant', 'receiver']);
        });
    }

    /**
     * Cancel a purchase order.
     */
    public function cancelPurchaseOrder(PurchaseOrder $purchaseOrder, ?string $reason = null): PurchaseOrder
    {
        if (!$purchaseOrder->canBeCancelled()) {
            throw new InvalidArgumentException("Cannot cancel purchase order in '{$purchaseOrder->status}' state.");
        }

        $notes = $purchaseOrder->notes;
        if ($reason) {
            $notes = trim($notes . "\n[Cancelled]: " . $reason);
        }

        $purchaseOrder->update([
            'status' => PurchaseOrder::STATUS_CANCELLED,
            'notes' => $notes,
        ]);

        return $purchaseOrder;
    }

    /**
     * Delete a draft or cancelled PO.
     */
    public function deletePurchaseOrder(PurchaseOrder $purchaseOrder): bool
    {
        if ($purchaseOrder->status === PurchaseOrder::STATUS_RECEIVED) {
            throw new InvalidArgumentException('Received purchase orders with hydrated stock cannot be deleted.');
        }

        return $purchaseOrder->delete();
    }
}
