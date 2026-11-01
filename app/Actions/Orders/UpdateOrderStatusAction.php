<?php

namespace App\Actions\Orders;

use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateOrderStatusAction
{
    /**
     * Permitted state transitions for orders.
     */
    public const VALID_TRANSITIONS = [
        Order::STATUS_PENDING => [
            Order::STATUS_CONFIRMED,
            Order::STATUS_CANCELLED,
        ],
        Order::STATUS_CONFIRMED => [
            Order::STATUS_PROCESSING,
            Order::STATUS_CANCELLED,
        ],
        Order::STATUS_PROCESSING => [
            Order::STATUS_SHIPPED,
            Order::STATUS_CANCELLED,
        ],
        Order::STATUS_SHIPPED => [
            Order::STATUS_DELIVERED,
            Order::STATUS_RETURNED,
            Order::STATUS_CANCELLED,
        ],
        Order::STATUS_DELIVERED => [
            Order::STATUS_RETURNED,
        ],
        Order::STATUS_CANCELLED => [],
        Order::STATUS_RETURNED => [],
    ];

    /**
     * Execute status update with state machine validation, inventory restock on cancel/return, and history tracking.
     *
     * @param Order $order
     * @param string $newStatus
     * @param string|null $adminNotes
     * @param User|null $adminUser
     * @return Order
     *
     * @throws ValidationException
     */
    public function execute(
        Order $order,
        string $newStatus,
        ?string $adminNotes = null,
        ?User $adminUser = null
    ): Order {
        $currentStatus = $order->order_status;

        if ($currentStatus === $newStatus) {
            if ($adminNotes !== null && $order->admin_notes !== $adminNotes) {
                $order->admin_notes = $adminNotes;
                $order->save();
            }
            return $order;
        }

        // Validate allowed status transition
        $allowed = self::VALID_TRANSITIONS[$currentStatus] ?? [];
        if (!in_array($newStatus, $allowed, true)) {
            $fromLabel = Order::ORDER_STATUSES[$currentStatus] ?? $currentStatus;
            $toLabel = Order::ORDER_STATUSES[$newStatus] ?? $newStatus;
            throw ValidationException::withMessages([
                'order_status' => ["Cannot transition order from {$fromLabel} to {$toLabel}."],
            ]);
        }

        return DB::transaction(function () use ($order, $currentStatus, $newStatus, $adminNotes, $adminUser) {
            $now = now();

            // Set timestamps accordingly
            if ($newStatus === Order::STATUS_CONFIRMED && !$order->confirmed_at) {
                $order->confirmed_at = $now;
            } elseif ($newStatus === Order::STATUS_SHIPPED && !$order->shipped_at) {
                $order->shipped_at = $now;
            } elseif ($newStatus === Order::STATUS_DELIVERED && !$order->delivered_at) {
                $order->delivered_at = $now;
                // If delivered with COD and unpaid, mark paid
                if ($order->payment_method === Order::METHOD_COD && $order->payment_status === Order::PAYMENT_UNPAID) {
                    $order->payment_status = Order::PAYMENT_PAID;
                }
            } elseif ($newStatus === Order::STATUS_CANCELLED && !$order->cancelled_at) {
                $order->cancelled_at = $now;
            }

            $order->order_status = $newStatus;
            if ($adminNotes !== null) {
                $order->admin_notes = $adminNotes;
            }
            $order->save();

            // Automatic inventory restock upon Cancellation or Return
            if ($newStatus === Order::STATUS_CANCELLED || $newStatus === Order::STATUS_RETURNED) {
                $this->restockOrderItems($order, $newStatus, $adminUser);
            }

            // Record status history audit log
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'user_id' => $adminUser?->id,
                'from_status' => $currentStatus,
                'to_status' => $newStatus,
                'action' => $newStatus === Order::STATUS_CANCELLED ? 'order_cancelled' : 'status_change',
                'comment' => $adminNotes ?: "Order status changed from " . ucfirst($currentStatus) . " to " . ucfirst($newStatus),
                'metadata' => [
                    'updated_by' => $adminUser ? $adminUser->name : 'System',
                    'role' => $adminUser ? $adminUser->role : 'system',
                ],
            ]);

            return $order;
        }, 5);
    }

    /**
     * Restore product and variant stock upon order cancellation or return.
     */
    protected function restockOrderItems(Order $order, string $reasonStatus, ?User $adminUser): void
    {
        $order->loadMissing('items.product', 'items.variant');

        foreach ($order->items as $item) {
            $qty = (int) $item->quantity;
            $product = $item->product;
            $variant = $item->variant;

            if (!$product) {
                continue;
            }

            if ($variant) {
                $stockBefore = (int) $variant->stock_quantity;
                $stockAfter = $stockBefore + $qty;

                $variant->stock_quantity = $stockAfter;
                $variant->save();

                // Synchronize parent product stock
                $product->stock_quantity = (int) $product->variants()
                    ->where('is_active', true)
                    ->sum('stock_quantity');
                $product->save();

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'type' => InventoryMovement::TYPE_RETURN_IN,
                    'quantity' => $qty,
                    'quantity_before' => $stockBefore,
                    'quantity_after' => $stockAfter,
                    'unit_cost' => (float) ($product->cost_price ?? 0.00),
                    'total_cost' => round($qty * (float) ($product->cost_price ?? 0.00), 2),
                    'reason' => "Order #{$order->order_number} " . ucfirst($reasonStatus) . " - Stock Restored",
                    'reference_type' => 'order',
                    'reference_id' => $order->id,
                    'notes' => "Restocked upon order {$reasonStatus}",
                    'created_by' => $adminUser?->id,
                ]);
            } else {
                $stockBefore = (int) $product->stock_quantity;
                $stockAfter = $stockBefore + $qty;

                $product->stock_quantity = $stockAfter;
                $product->save();

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'product_variant_id' => null,
                    'type' => InventoryMovement::TYPE_RETURN_IN,
                    'quantity' => $qty,
                    'quantity_before' => $stockBefore,
                    'quantity_after' => $stockAfter,
                    'unit_cost' => (float) ($product->cost_price ?? 0.00),
                    'total_cost' => round($qty * (float) ($product->cost_price ?? 0.00), 2),
                    'reason' => "Order #{$order->order_number} " . ucfirst($reasonStatus) . " - Stock Restored",
                    'reference_type' => 'order',
                    'reference_id' => $order->id,
                    'notes' => "Restocked upon order {$reasonStatus}",
                    'created_by' => $adminUser?->id,
                ]);
            }
        }
    }
}
