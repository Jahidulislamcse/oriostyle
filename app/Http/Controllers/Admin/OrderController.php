<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Admin\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Display a listing of orders with filters and summary metrics.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only([
            'search',
            'status',
            'payment_status',
            'payment_method',
            'date_from',
            'date_to',
        ]);

        $orders = $this->orderService->getOrders($filters);
        $metrics = $this->orderService->getOrderMetrics();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'metrics' => $metrics,
            'filters' => $filters,
            'orderStatuses' => Order::ORDER_STATUSES,
            'paymentStatuses' => Order::PAYMENT_STATUSES,
            'paymentMethods' => Order::PAYMENT_METHODS,
        ]);
    }

    /**
     * Display the specified order details and fulfillment controls.
     */
    public function show(Order $order): Response
    {
        $detailedOrder = $this->orderService->getOrderDetails($order);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $detailedOrder,
            'orderStatuses' => Order::ORDER_STATUSES,
            'paymentStatuses' => Order::PAYMENT_STATUSES,
            'paymentMethods' => Order::PAYMENT_METHODS,
        ]);
    }

    /**
     * Update order workflow status.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'order_status' => ['required', 'string', 'in:' . implode(',', array_keys(Order::ORDER_STATUSES))],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->orderService->updateOrderStatus(
            $order,
            $validated['order_status'],
            $validated['admin_notes'] ?? null
        );

        return back()->with('success', "Order {$order->order_number} status updated to " . ucfirst($validated['order_status']) . '.');
    }

    /**
     * Update order payment status.
     */
    public function updatePayment(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'payment_status' => ['required', 'string', 'in:' . implode(',', array_keys(Order::PAYMENT_STATUSES))],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->orderService->updatePaymentStatus(
            $order,
            $validated['payment_status'],
            $validated['admin_notes'] ?? null
        );

        return back()->with('success', "Order {$order->order_number} payment status updated to " . ucfirst($validated['payment_status']) . '.');
    }

    /**
     * Display printable thermal / standard A4 invoice.
     */
    public function invoice(Order $order): Response
    {
        $detailedOrder = $this->orderService->getOrderDetails($order);

        return Inertia::render('Admin/Orders/Invoice', [
            'order' => $detailedOrder,
        ]);
    }
}
