<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Carbon;

class AdminNotificationService
{
    /**
     * Retrieve aggregated backoffice alerts and recent notification items.
     *
     * @return array{
     *     total_unread: int,
     *     pending_orders_count: int,
     *     low_stock_count: int,
     *     out_of_stock_count: int,
     *     recent_orders: array<int, array<string, mixed>>,
     *     stock_alerts: array<int, array<string, mixed>>
     * }
     */
    public function getHeaderAlerts(): array
    {
        // 1. Pending & newly received orders count
        $pendingOrdersCount = Order::where('order_status', Order::STATUS_PENDING)->count();

        // 2. Low-stock products: stock <= low_stock_threshold and stock > 0
        $lowStockCount = Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->where('is_active', true)
            ->count();

        // 3. Out-of-stock products: stock <= 0
        $outOfStockCount = Product::where('stock_quantity', '<=', 0)
            ->where('is_active', true)
            ->count();

        // 4. Recent pending orders (latest 5)
        $recentOrders = Order::where('order_status', Order::STATUS_PENDING)
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get(['id', 'order_number', 'customer_name', 'customer_phone', 'total_amount', 'currency', 'created_at'])
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'total_amount' => (float) $order->total_amount,
                'currency' => $order->currency ?: 'BDT',
                'time_ago' => $order->created_at ? $order->created_at->diffForHumans() : '',
                'url' => route('admin.orders.show', $order->id),
            ])
            ->toArray();

        // 5. Urgent low/out-of-stock items (top 5)
        $stockAlerts = Product::query()
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereColumn('stock_quantity', '<=', 'low_stock_threshold')->orWhere('stock_quantity', '<=', 0))
            ->orderBy('stock_quantity', 'asc')
            ->limit(5)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold'])
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'stock_quantity' => (int) $p->stock_quantity,
                'low_stock_threshold' => (int) $p->low_stock_threshold,
                'is_out_of_stock' => $p->stock_quantity <= 0,
                'url' => route('admin.products.edit', $p->id),
            ])
            ->toArray();

        $totalUnread = $pendingOrdersCount + $lowStockCount + $outOfStockCount;

        return [
            'total_unread' => $totalUnread,
            'pending_orders_count' => $pendingOrdersCount,
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'recent_orders' => $recentOrders,
            'stock_alerts' => $stockAlerts,
        ];
    }
}
