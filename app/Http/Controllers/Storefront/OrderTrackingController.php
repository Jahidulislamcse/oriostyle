<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function __construct(
        protected SettingService $settingService
    ) {}

    /**
     * Display order tracking portal and lookup result.
     */
    public function index(Request $request): Response
    {
        $orderNumber = trim((string) $request->query('order_number', ''));
        $phoneOrEmail = trim((string) $request->query('phone', ''));
        $user = $request->user();

        $trackedOrder = null;
        $errorMessage = null;

        if ($orderNumber !== '') {
            $trackedOrder = $this->lookupOrder($orderNumber, $phoneOrEmail, $user, $errorMessage);
        }

        // If customer is authenticated, fetch their recent orders for quick 1-click tracing
        $userRecentOrders = [];
        if ($user) {
            $userRecentOrders = Order::where('user_id', $user->id)
                ->withCount('items')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn (Order $o) => [
                    'order_number' => $o->order_number,
                    'created_at' => $o->created_at->format('d M, Y'),
                    'order_status' => $o->order_status,
                    'order_status_label' => Order::ORDER_STATUSES[$o->order_status] ?? ucfirst($o->order_status),
                    'total_amount' => (float) $o->total_amount,
                    'items_count' => $o->items_count,
                    'payment_method' => Order::PAYMENT_METHODS[$o->payment_method] ?? ucfirst($o->payment_method),
                ]);
        }

        $currencySymbol = (string) $this->settingService->get('default_currency_symbol', '৳');
        $supportPhone = (string) $this->settingService->get('support_phone', '01XXXXXXXXX');
        $supportEmail = (string) $this->settingService->get('support_email', 'support@oriostyle.com');

        return Inertia::render('Storefront/TrackOrder', [
            'trackedOrder' => $trackedOrder,
            'searchedOrderNumber' => $orderNumber,
            'searchedPhone' => $phoneOrEmail,
            'errorMessage' => $errorMessage,
            'userRecentOrders' => $userRecentOrders,
            'currencySymbol' => $currencySymbol,
            'supportPhone' => $supportPhone,
            'supportEmail' => $supportEmail,
        ]);
    }

    /**
     * Handle form post submission and redirect with query string for clean bookmarkable URL.
     */
    public function track(Request $request): RedirectResponse
    {
        $request->validate([
            'order_number' => ['required', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:100'],
        ]);

        return redirect()->route('orders.track', [
            'order_number' => trim($request->input('order_number')),
            'phone' => trim((string) $request->input('phone')),
        ]);
    }

    /**
     * Direct link helper: /orders/{orderNumber}/track
     */
    public function show(Request $request, string $orderNumber): RedirectResponse
    {
        return redirect()->route('orders.track', [
            'order_number' => $orderNumber,
            'phone' => $request->query('phone'),
        ]);
    }

    /**
     * Query order safely and build tracking presentation payload.
     */
    protected function lookupOrder(string $orderNumber, string $phoneOrEmail, $user, ?string &$errorMessage): ?array
    {
        $query = Order::with([
            'items.product.primaryImage',
            'items.variant',
            'statusHistories.user:id,name',
        ])->where('order_number', $orderNumber);

        // Security check:
        // 1. If user is logged in AND is an admin or staff member: allow tracking any order
        // 2. If user is logged in AND this order belongs to their user_id: allow tracking without phone
        // 3. Otherwise: require matching phone number or email for privacy protection

        if ($user && $user->hasAdminAccess()) {
            $order = $query->first();
        } elseif ($user && $query->clone()->where('user_id', $user->id)->exists()) {
            $order = $query->where('user_id', $user->id)->first();
        } else {
            if ($phoneOrEmail === '') {
                $errorMessage = "Please provide the phone number or email address associated with Order #{$orderNumber} to verify ownership.";
                return null;
            }

            // Clean phone input for flexible match (e.g. handle +880 or leading zeroes)
            $cleanDigits = preg_replace('/[^0-9]/', '', $phoneOrEmail);
            $suffix = strlen($cleanDigits) >= 8 ? substr($cleanDigits, -10) : $cleanDigits;

            $order = $query->where(function ($q) use ($phoneOrEmail, $suffix) {
                if ($suffix !== '') {
                    $q->where('customer_phone', 'like', "%{$suffix}%");
                }
                $q->orWhere('customer_email', strtolower($phoneOrEmail));
            })->first();
        }

        if (! $order) {
            $errorMessage = "No order found matching Reference #{$orderNumber} with the provided contact information. Please check your order confirmation details and try again.";
            return null;
        }

        $currencySymbol = (string) $this->settingService->get('default_currency_symbol', '৳');

        // Build progressive fulfillment timeline
        $timeline = $this->buildTimeline($order);

        // Estimated delivery label
        $estimatedDelivery = $order->city === 'Inside Dhaka'
            ? (string) $this->settingService->get('estimated_delivery_inside', '24 - 48 Hours')
            : (string) $this->settingService->get('estimated_delivery_outside', '3 - 5 Days');

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'order_status' => $order->order_status,
            'order_status_label' => Order::ORDER_STATUSES[$order->order_status] ?? ucfirst($order->order_status),
            'payment_method' => $order->payment_method,
            'payment_method_label' => Order::PAYMENT_METHODS[$order->payment_method] ?? ucfirst($order->payment_method),
            'payment_status' => $order->payment_status,
            'payment_status_label' => Order::PAYMENT_STATUSES[$order->payment_status] ?? ucfirst($order->payment_status),
            'customer_name' => $order->customer_name,
            'customer_phone' => $user ? $order->customer_phone : $this->maskPhone($order->customer_phone),
            'customer_email' => $user ? $order->customer_email : $this->maskEmail($order->customer_email),
            'shipping_address' => $order->shipping_address,
            'city' => $order->city,
            'zone' => $order->zone,
            'postal_code' => $order->postal_code,
            'subtotal' => (float) $order->subtotal,
            'shipping_charge' => (float) $order->shipping_charge,
            'discount_amount' => (float) $order->discount_amount,
            'total_amount' => (float) $order->total_amount,
            'currency' => $order->currency,
            'currency_symbol' => $currencySymbol,
            'estimated_delivery' => $estimatedDelivery,
            'created_at' => $order->created_at->format('d M, Y h:i A'),
            'confirmed_at' => $order->confirmed_at?->format('d M, Y h:i A'),
            'shipped_at' => $order->shipped_at?->format('d M, Y h:i A'),
            'delivered_at' => $order->delivered_at?->format('d M, Y h:i A'),
            'cancelled_at' => $order->cancelled_at?->format('d M, Y h:i A'),
            'timeline' => $timeline,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'variant_attributes' => $item->variant_attributes,
                'unit_price' => (float) $item->unit_price,
                'quantity' => (int) $item->quantity,
                'line_total' => (float) $item->line_total,
                'image_url' => $item->image_path,
            ]),
            'status_histories' => $order->statusHistories->map(fn ($hist) => [
                'id' => $hist->id,
                'from_status' => $hist->from_status ? (Order::ORDER_STATUSES[$hist->from_status] ?? $hist->from_status) : null,
                'to_status' => Order::ORDER_STATUSES[$hist->to_status] ?? $hist->to_status,
                'action' => $hist->action,
                'comment' => $hist->comment,
                'created_at' => $hist->created_at->format('d M, Y h:i A'),
                'author' => $hist->user?->name ?? 'System Automated',
            ]),
        ];
    }

    /**
     * Build progressive timeline steps depending on current order status.
     */
    protected function buildTimeline(Order $order): array
    {
        $status = $order->order_status;

        $isCancelled = $status === Order::STATUS_CANCELLED;
        $isReturned = $status === Order::STATUS_RETURNED;

        $stepOrder = [
            Order::STATUS_PENDING => 1,
            Order::STATUS_CONFIRMED => 2,
            Order::STATUS_PROCESSING => 3,
            Order::STATUS_SHIPPED => 4,
            Order::STATUS_DELIVERED => 5,
        ];

        $currentStepNumber = $stepOrder[$status] ?? 1;

        $steps = [
            [
                'step' => 'placed',
                'name' => 'Order Placed',
                'desc' => 'We received your order request.',
                'date' => $order->created_at->format('d M, Y h:i A'),
                'completed' => true,
                'current' => $status === Order::STATUS_PENDING,
                'icon' => 'ri-shopping-cart-2-line',
            ],
            [
                'step' => 'confirmed',
                'name' => 'Order Confirmed',
                'desc' => 'Inventory verified and order confirmed by staff.',
                'date' => $order->confirmed_at?->format('d M, Y h:i A'),
                'completed' => !$isCancelled && $currentStepNumber >= 2,
                'current' => $status === Order::STATUS_CONFIRMED,
                'icon' => 'ri-check-double-line',
            ],
            [
                'step' => 'processing',
                'name' => 'Packed & Ready',
                'desc' => 'Items quality-checked and packed securely.',
                'date' => null,
                'completed' => !$isCancelled && $currentStepNumber >= 3,
                'current' => $status === Order::STATUS_PROCESSING,
                'icon' => 'ri-box-3-line',
            ],
            [
                'step' => 'shipped',
                'name' => 'Dispatched / In Transit',
                'desc' => 'Handed over to delivery courier partner.',
                'date' => $order->shipped_at?->format('d M, Y h:i A'),
                'completed' => !$isCancelled && $currentStepNumber >= 4,
                'current' => $status === Order::STATUS_SHIPPED,
                'icon' => 'ri-truck-line',
            ],
            [
                'step' => 'delivered',
                'name' => 'Delivered',
                'desc' => 'Package delivered to recipient address.',
                'date' => $order->delivered_at?->format('d M, Y h:i A'),
                'completed' => $status === Order::STATUS_DELIVERED,
                'current' => $status === Order::STATUS_DELIVERED,
                'icon' => 'ri-checkbox-circle-line',
            ],
        ];

        return [
            'steps' => $steps,
            'is_cancelled' => $isCancelled,
            'cancelled_date' => $order->cancelled_at?->format('d M, Y h:i A'),
            'is_returned' => $isReturned,
            'current_status' => $status,
        ];
    }

    /**
     * Privacy masking for phone number (e.g. 01711223344 -> 0171****344).
     */
    protected function maskPhone(?string $phone): ?string
    {
        if (! $phone || strlen($phone) < 7) {
            return $phone;
        }

        $length = strlen($phone);
        $start = substr($phone, 0, 4);
        $end = substr($phone, -3);
        $stars = str_repeat('*', max(3, $length - 7));

        return "{$start}{$stars}{$end}";
    }

    /**
     * Privacy masking for email address (e.g. user@example.com -> u***@example.com).
     */
    protected function maskEmail(?string $email): ?string
    {
        if (! $email || ! str_contains($email, '@')) {
            return $email;
        }

        [$name, $domain] = explode('@', $email, 2);
        $maskedName = substr($name, 0, 1) . str_repeat('*', max(3, strlen($name) - 1));

        return "{$maskedName}@{$domain}";
    }
}
