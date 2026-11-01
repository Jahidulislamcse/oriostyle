<?php

namespace App\Services\Admin;

use App\Actions\Orders\UpdateOrderStatusAction;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class OrderService
{
    public function __construct(
        protected UpdateOrderStatusAction $updateOrderStatusAction
    ) {}
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
     * Get single order with complete line items, variant associations, and status histories.
     */
    public function getOrderDetails(Order $order): Order
    {
        return $order->load([
            'user:id,name,email,phone',
            'items.product.primaryImage',
            'items.variant',
            'statusHistories.user:id,name,role',
        ]);
    }

    /**
     * Update order workflow status with transition timestamps and audit history.
     */
    public function updateOrderStatus(Order $order, string $newStatus, ?string $adminNotes = null, ?User $adminUser = null): Order
    {
        $this->updateOrderStatusAction->execute($order, $newStatus, $adminNotes, $adminUser);

        return $this->getOrderDetails($order->fresh());
    }

    /**
     * Update order payment status.
     */
    public function updatePaymentStatus(Order $order, string $paymentStatus, ?string $adminNotes = null, ?User $adminUser = null): Order
    {
        $oldPaymentStatus = $order->payment_status;
        $order->payment_status = $paymentStatus;

        if ($adminNotes !== null) {
            $order->admin_notes = $adminNotes;
        }

        $order->save();

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'user_id' => $adminUser?->id,
            'from_status' => $oldPaymentStatus,
            'to_status' => $paymentStatus,
            'action' => 'payment_change',
            'comment' => $adminNotes ?: "Payment status updated to " . ucfirst($paymentStatus),
            'metadata' => [
                'updated_by' => $adminUser ? $adminUser->name : 'System',
                'role' => $adminUser ? $adminUser->role : 'system',
            ],
        ]);

        return $this->getOrderDetails($order->fresh());
    }
}
