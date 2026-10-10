<?php

namespace App\Services\Inventory;

use App\Models\DamageLog;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class InventoryService
{
    /**
     * Get aggregate inventory metrics.
     */
    public function getMetrics(): array
    {
        $totalProducts = Product::count();
        $totalVariants = ProductVariant::count();
        $totalStockUnits = (int) Product::sum('stock_quantity');
        
        // Inventory valuation: sum of (stock_quantity * cost_price)
        $totalValuation = (float) Product::selectRaw('SUM(stock_quantity * COALESCE(cost_price, 0)) as valuation')
            ->value('valuation') ?? 0.00;

        // Low stock count: stock <= low_stock_threshold and stock > 0
        $lowStockCount = Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->count();

        // Out of stock count: stock <= 0
        $outOfStockCount = Product::where('stock_quantity', '<=', 0)->count();

        // Total damage loss amount
        $totalDamageLoss = (float) DamageLog::sum('total_loss_amount');
        $damagedUnitsTotal = (int) DamageLog::sum('quantity');

        return [
            'total_products' => $totalProducts,
            'total_variants' => $totalVariants,
            'total_stock_units' => $totalStockUnits,
            'total_valuation' => round($totalValuation, 2),
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'total_damage_loss' => round($totalDamageLoss, 2),
            'damaged_units_total' => $damagedUnitsTotal,
        ];
    }

    /**
     * Get paginated stock summary list with status badges and threshold warnings.
     */
    public function getStockSummary(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::query()
            ->with(['category:id,name', 'brand:id,name', 'variants' => fn($q) => $q->where('is_active', true)]);

        if (!empty($filters['search'])) {
            $s = trim($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('sku', 'like', "%{$s}%");
            });
        }

        if (!empty($filters['stock_status'])) {
            switch ($filters['stock_status']) {
                case 'out_of_stock':
                    $query->where('stock_quantity', '<=', 0);
                    break;
                case 'low_stock':
                    $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                        ->where('stock_quantity', '>', 0);
                    break;
                case 'in_stock':
                    $query->whereColumn('stock_quantity', '>', 'low_stock_threshold');
                    break;
            }
        }

        if (!empty($filters['category_id']) && $filters['category_id'] !== 'all') {
            $query->where('category_id', $filters['category_id']);
        }

        return $query->orderBy('stock_quantity', 'asc')->paginate($perPage)->withQueryString();
    }

    /**
     * Get paginated low stock items.
     */
    public function getLowStockItems(int $perPage = 15): LengthAwarePaginator
    {
        return Product::query()
            ->with(['category:id,name', 'brand:id,name', 'variants'])
            ->where(function ($q) {
                $q->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
            })
            ->orderBy('stock_quantity', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Get paginated movement ledger entries with filters.
     */
    public function getInventoryLedger(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = InventoryMovement::query()
            ->with(['product:id,name,sku,cost_price', 'variant:id,sku,size,color', 'creator:id,name']);

        if (!empty($filters['product_id']) && $filters['product_id'] !== 'all') {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $s = trim($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->where('reason', 'like', "%{$s}%")
                    ->orWhere('notes', 'like', "%{$s}%")
                    ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%"));
            });
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    /**
     * Get paginated damage logs.
     */
    public function getDamageLogs(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = DamageLog::query()
            ->with(['product:id,name,sku,cost_price', 'variant:id,sku,size,color', 'reporter:id,name']);

        if (!empty($filters['reason']) && $filters['reason'] !== 'all') {
            $query->where('reason', $filters['reason']);
        }

        if (!empty($filters['search'])) {
            $s = trim($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->where('damage_number', 'like', "%{$s}%")
                    ->orWhere('notes', 'like', "%{$s}%")
                    ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$s}%")->orWhere('sku', 'like', "%{$s}%"));
            });
        }

        return $query->latest('id')->paginate($perPage)->withQueryString();
    }

    /**
     * Record a manual stock adjustment (increase, decrease, or set exact count).
     */
    public function recordAdjustment(array $data, ?int $userId = null): InventoryMovement
    {
        return DB::transaction(function () use ($data, $userId) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $variant = !empty($data['product_variant_id'])
                ? ProductVariant::lockForUpdate()->where('product_id', $product->id)->find($data['product_variant_id'])
                : null;

            $action = $data['action'] ?? 'increase'; // increase, decrease, set_exact
            $qtyInput = (int) ($data['quantity'] ?? 0);

            if ($qtyInput <= 0 && $action !== 'set_exact') {
                throw new InvalidArgumentException('Quantity must be greater than zero for stock adjustment.');
            }

            $currentStock = $variant ? (int) $variant->stock_quantity : (int) $product->stock_quantity;
            $delta = 0;
            $newStock = 0;

            if ($action === 'increase') {
                $delta = $qtyInput;
                $newStock = $currentStock + $delta;
                $type = InventoryMovement::TYPE_ADJUSTMENT_INCREASE;
            } elseif ($action === 'decrease') {
                $delta = -$qtyInput;
                $newStock = $currentStock - $qtyInput;
                if ($newStock < 0) {
                    throw new InvalidArgumentException("Cannot reduce stock by {$qtyInput}. Current stock is only {$currentStock}.");
                }
                $type = InventoryMovement::TYPE_ADJUSTMENT_DECREASE;
            } elseif ($action === 'set_exact') {
                if ($qtyInput < 0) {
                    throw new InvalidArgumentException('Exact stock count cannot be negative.');
                }
                $delta = $qtyInput - $currentStock;
                $newStock = $qtyInput;
                $type = $delta >= 0 ? InventoryMovement::TYPE_ADJUSTMENT_INCREASE : InventoryMovement::TYPE_ADJUSTMENT_DECREASE;
            } else {
                throw new InvalidArgumentException("Invalid adjustment action '{$action}'.");
            }

            // Update product and variant stock
            if ($variant) {
                $variant->stock_quantity = $newStock;
                $variant->save();

                // Sync parent product stock to sum of active variants
                $product->stock_quantity = (int) $product->variants()->where('is_active', true)->sum('stock_quantity');
                $product->save();
            } else {
                $product->stock_quantity = $newStock;
                $product->save();
            }

            $unitCost = (float) ($product->cost_price ?? 0);
            $totalCost = round(abs($delta) * $unitCost, 2);

            return InventoryMovement::create([
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'type' => $type,
                'quantity' => $delta,
                'quantity_before' => $currentStock,
                'quantity_after' => $newStock,
                'unit_cost' => $unitCost,
                'total_cost' => $totalCost,
                'reason' => $data['reason'] ?? 'Manual Inventory Adjustment',
                'reference_type' => null,
                'reference_id' => null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);
        });
    }

    /**
     * Record a damaged/loss stock write-off:
     * Decreases inventory stock, calculates financial loss, and logs movement.
     */
    public function recordDamage(array $data, ?int $userId = null): DamageLog
    {
        return DB::transaction(function () use ($data, $userId) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $variant = !empty($data['product_variant_id'])
                ? ProductVariant::lockForUpdate()->where('product_id', $product->id)->find($data['product_variant_id'])
                : null;

            $qty = (int) ($data['quantity'] ?? 1);
            if ($qty <= 0) {
                throw new InvalidArgumentException('Damaged quantity must be at least 1.');
            }

            $currentStock = $variant ? (int) $variant->stock_quantity : (int) $product->stock_quantity;
            if ($currentStock < $qty) {
                throw new InvalidArgumentException("Cannot write off {$qty} units. Current stock is only {$currentStock}.");
            }

            $newStock = $currentStock - $qty;

            // Deduct stock
            if ($variant) {
                $variant->stock_quantity = $newStock;
                $variant->save();

                $product->stock_quantity = (int) $product->variants()->where('is_active', true)->sum('stock_quantity');
                $product->save();
            } else {
                $product->stock_quantity = $newStock;
                $product->save();
            }

            $unitCost = (float) ($product->cost_price ?? 0);
            $totalLoss = round($qty * $unitCost, 2);
            $damageNumber = $this->generateDamageNumber();

            $damageLog = DamageLog::create([
                'damage_number' => $damageNumber,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'quantity' => $qty,
                'unit_cost' => $unitCost,
                'total_loss_amount' => $totalLoss,
                'reason' => $data['reason'] ?? 'Damaged stock write-off',
                'status' => DamageLog::STATUS_WRITTEN_OFF,
                'notes' => $data['notes'] ?? null,
                'reported_by' => $userId,
            ]);

            // Create ledger entry linked to damage log
            InventoryMovement::create([
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'type' => InventoryMovement::TYPE_DAMAGE_LOSS,
                'quantity' => -$qty,
                'quantity_before' => $currentStock,
                'quantity_after' => $newStock,
                'unit_cost' => $unitCost,
                'total_cost' => $totalLoss,
                'reason' => "Damage Write-off: {$damageLog->damage_number} (" . ($data['reason'] ?? 'damaged') . ")",
                'reference_type' => DamageLog::class,
                'reference_id' => $damageLog->id,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            return $damageLog;
        });
    }

    /**
     * Record arbitrary movement directly into ledger.
     */
    public function recordMovement(array $data): InventoryMovement
    {
        return InventoryMovement::create($data);
    }

    /**
     * Update product low stock alert threshold.
     */
    public function updateLowStockThreshold(Product $product, int $threshold): Product
    {
        if ($threshold < 0) {
            throw new InvalidArgumentException('Threshold must be zero or a positive integer.');
        }

        $product->update(['low_stock_threshold' => $threshold]);
        return $product;
    }

    /**
     * Generate unique sequential Damage Number: DMG-YYYY-XXXX.
     */
    public function generateDamageNumber(): string
    {
        $year = date('Y');
        $prefix = "DMG-{$year}-";

        $last = DamageLog::where('damage_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->value('damage_number');

        if ($last) {
            $seq = (int) substr($last, strlen($prefix)) + 1;
        } else {
            $seq = 1;
        }

        return $prefix . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }
}
