<?php

namespace App\Services\Admin;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class OrderService
{
    /**
     * Get paginated orders list with search and filters.
     */
    public function getOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Order::query()
            ->with(['user:id,name,email,phone'])
            ->withCount('items')
            ->filter($filters)
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Calculate summary metrics for the orders overview.
     */
    public function getOrderMetrics(): array
    {
        $today = Carbon::today();

        $totalOrders = Order::count();
        $pendingOrders = Order::pending()->count();
        $processingOrders = Order::whereIn('order_status', [
            Order::STATUS_CONFIRMED,
            Order::STATUS_PROCESSING,
            Order::STATUS_SHIPPED,
        ])->count();
        $deliveredOrders = Order::delivered()->count();
        $cancelledOrders = Order::cancelled()->count();

        $totalRevenue = (float) Order::where(function ($q) {
            $q->where('payment_status', Order::PAYMENT_PAID)
              ->orWhere('order_status', Order::STATUS_DELIVERED);
        })->sum('total_amount');

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayRevenue = (float) Order::whereDate('created_at', $today)
            ->where(function ($q) {
                $q->where('payment_status', Order::PAYMENT_PAID)
                  ->orWhere('order_status', Order::STATUS_DELIVERED);
            })->sum('total_amount');

        return [
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'processing_orders' => $processingOrders,
            'delivered_orders' => $deliveredOrders,
            'cancelled_orders' => $cancelledOrders,
            'total_revenue' => $totalRevenue,
            'today_orders' => $todayOrders,
            'today_revenue' => $todayRevenue,
        ];
    }

    /**
     * Get single order with complete line items and product associations.
     */
    public function getOrderDetails(Order $order): Order
    {
        return $order->load([
            'user:id,name,email,phone',
            'items.product.primaryImage',
            'items.variant',
        ]);
    }

    /**
     * Update order workflow status with transition timestamps.
     */
    public function updateOrderStatus(Order $order, string $newStatus, ?string $adminNotes = null): Order
    {
        $order->order_status = $newStatus;

        $now = now();
        if ($newStatus === Order::STATUS_CONFIRMED && !$order->confirmed_at) {
            $order->confirmed_at = $now;
        } elseif ($newStatus === Order::STATUS_SHIPPED && !$order->shipped_at) {
            $order->shipped_at = $now;
        } elseif ($newStatus === Order::STATUS_DELIVERED && !$order->delivered_at) {
            $order->delivered_at = $now;
            // On delivery of COD order, automatically mark payment as paid if unpaid
            if ($order->payment_method === Order::METHOD_COD && $order->payment_status === Order::PAYMENT_UNPAID) {
                $order->payment_status = Order::PAYMENT_PAID;
            }
        } elseif ($newStatus === Order::STATUS_CANCELLED && !$order->cancelled_at) {
            $order->cancelled_at = $now;
        }

        if ($adminNotes !== null) {
            $order->admin_notes = $adminNotes;
        }

        $order->save();

        return $this->getOrderDetails($order->fresh());
    }

    /**
     * Update order payment status.
     */
    public function updatePaymentStatus(Order $order, string $paymentStatus, ?string $adminNotes = null): Order
    {
        $order->payment_status = $paymentStatus;

        if ($adminNotes !== null) {
            $order->admin_notes = $adminNotes;
        }

        $order->save();

        return $this->getOrderDetails($order->fresh());
    }
}
