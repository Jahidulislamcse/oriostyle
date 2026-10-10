<?php

namespace Database\Seeders;

use App\Models\DamageLog;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Seed initial inventory movements and damage write-offs.
     */
    public function run(): void
    {
        $admin = User::where('role', 'super_admin')->first();
        $products = Product::with('variants')->take(5)->get();

        if ($products->isEmpty()) {
            return;
        }

        // 1. Initial Opening Stock Movements for products
        foreach ($products as $product) {
            $currentStock = (int) $product->stock_quantity;
            $unitCost = (float) ($product->cost_price ?: 1200);

            InventoryMovement::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'type' => InventoryMovement::TYPE_CYCLE_COUNT,
                    'reason' => 'Initial Inventory Audit & Opening Stock Baseline',
                ],
                [
                    'product_variant_id' => null,
                    'quantity' => $currentStock,
                    'quantity_before' => 0,
                    'quantity_after' => $currentStock,
                    'unit_cost' => $unitCost,
                    'total_cost' => round($currentStock * $unitCost, 2),
                    'notes' => 'Opening stock verified by warehouse inventory team.',
                    'created_by' => $admin?->id,
                ]
            );
        }

        // 2. Sample Stock Adjustments
        $firstProduct = $products->first();
        if ($firstProduct && (int) $firstProduct->stock_quantity > 5) {
            $current = (int) $firstProduct->stock_quantity;
            $delta = 3;
            $new = $current + $delta;
            $firstProduct->update(['stock_quantity' => $new]);

            InventoryMovement::firstOrCreate(
                [
                    'product_id' => $firstProduct->id,
                    'reason' => 'Cycle count audit discrepancy',
                    'quantity' => $delta,
                ],
                [
                    'product_variant_id' => null,
                    'type' => InventoryMovement::TYPE_ADJUSTMENT_INCREASE,
                    'quantity_before' => $current,
                    'quantity_after' => $new,
                    'unit_cost' => (float) $firstProduct->cost_price,
                    'total_cost' => round($delta * (float) $firstProduct->cost_price, 2),
                    'notes' => 'Found 3 unopened luxury gift boxes during weekly physical shelf count.',
                    'created_by' => $admin?->id,
                ]
            );
        }

        // 3. Sample Damage Log & Write-Off
        $secondProduct = $products->skip(1)->first();
        if ($secondProduct && (int) $secondProduct->stock_quantity >= 3) {
            $damagedQty = 2;
            $current = (int) $secondProduct->stock_quantity;
            $new = $current - $damagedQty;
            $secondProduct->update(['stock_quantity' => $new]);

            $cost = (float) ($secondProduct->cost_price ?: 950);
            $loss = round($damagedQty * $cost, 2);

            $damageLog = DamageLog::firstOrCreate(
                ['damage_number' => 'DMG-2026-0001'],
                [
                    'product_id' => $secondProduct->id,
                    'product_variant_id' => null,
                    'quantity' => $damagedQty,
                    'unit_cost' => $cost,
                    'total_loss_amount' => $loss,
                    'reason' => 'transit_damage',
                    'status' => DamageLog::STATUS_WRITTEN_OFF,
                    'notes' => 'Outer carton crushed and water ingress during logistics transit.',
                    'reported_by' => $admin?->id,
                ]
            );

            InventoryMovement::firstOrCreate(
                [
                    'product_id' => $secondProduct->id,
                    'reference_type' => DamageLog::class,
                    'reference_id' => $damageLog->id,
                ],
                [
                    'product_variant_id' => null,
                    'type' => InventoryMovement::TYPE_DAMAGE_LOSS,
                    'quantity' => -$damagedQty,
                    'quantity_before' => $current,
                    'quantity_after' => $new,
                    'unit_cost' => $cost,
                    'total_cost' => $loss,
                    'reason' => "Damage Write-off: DMG-2026-0001 (transit_damage)",
                    'notes' => 'Written off and disposed following QC inspection.',
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
