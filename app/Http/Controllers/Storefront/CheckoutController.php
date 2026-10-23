<?php

namespace App\Http\Controllers\Storefront;

use App\Actions\Orders\CreateOrderAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CheckoutRequest;
use App\Models\Order;
use App\Services\Settings\SettingService;
use App\Services\Storefront\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        protected SettingService $settingService
    ) {}

    /**
     * Display the single-page checkout view.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->cartService->getCartForRequest($request);

        // Redirect to shop if cart has no line items
        if ($cart->items->isEmpty()) {
            return redirect()->route('shop.index')->with(
                'info',
                'Your shopping bag is empty. Please add items before proceeding to checkout.'
            );
        }

        $cartPayload = $this->cartService->formatCartPayload($cart);

        // Retrieve shipping policy configurations
        $shippingConfig = [
            'inside_charge' => (float) $this->settingService->get('shipping_charge_inside', 70.00),
            'outside_charge' => (float) $this->settingService->get('shipping_charge_outside', 130.00),
            'free_shipping_threshold' => (float) $this->settingService->get('free_shipping_threshold', 2000.00),
            'estimated_delivery_inside' => (string) $this->settingService->get('estimated_delivery_inside', '24 - 48 Hours'),
            'estimated_delivery_outside' => (string) $this->settingService->get('estimated_delivery_outside', '3 - 5 Days'),
        ];

        // Retrieve payment methods availability
        $paymentConfig = [
            'cod_enabled' => (bool) $this->settingService->get('cash_on_delivery_enabled', true),
            'online_enabled' => (bool) $this->settingService->get('online_payment_enabled', true),
            'methods' => Order::PAYMENT_METHODS,
        ];

        // Customer pre-fill profile
        $user = $request->user();
        $customerProfile = $user ? [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'shipping_address' => $user->shipping_address ?? null,
            'city' => $user->city ?? null,
        ] : null;

        return Inertia::render('Storefront/Checkout', [
            'cart' => $cartPayload,
            'shippingConfig' => $shippingConfig,
            'paymentConfig' => $paymentConfig,
            'customerProfile' => $customerProfile,
        ]);
    }

    /**
     * Process checkout form submission and create order atomically.
     */
    public function store(CheckoutRequest $request, CreateOrderAction $createOrderAction): RedirectResponse
    {
        $cart = $this->cartService->getCartForRequest($request);

        $order = $createOrderAction->execute(
            $cart,
            $request->validated(),
            $request->user()
        );

        return redirect()->route('checkout.success', $order->order_number)->with(
            'success',
            "Thank you! Your order #{$order->order_number} has been placed successfully."
        );
    }

    /**
     * Display the order success confirmation view.
     */
    public function success(Request $request, string $orderNumber): Response
    {
        $order = Order::with([
            'items.product.primaryImage',
            'items.variant',
        ])
        ->where('order_number', $orderNumber)
        ->firstOrFail();

        $currencySymbol = (string) $this->settingService->get('default_currency_symbol', '৳');

        return Inertia::render('Storefront/OrderSuccess', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'created_at' => $order->created_at->format('d M, Y h:i A'),
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'city' => $order->city,
                'payment_method' => $order->payment_method,
                'payment_method_label' => Order::PAYMENT_METHODS[$order->payment_method] ?? ucfirst($order->payment_method),
                'payment_status' => $order->payment_status,
                'order_status' => $order->order_status,
                'subtotal' => $order->subtotal,
                'shipping_charge' => $order->shipping_charge,
                'discount_amount' => $order->discount_amount,
                'total_amount' => $order->total_amount,
                'currency' => $order->currency,
                'currency_symbol' => $currencySymbol,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'variant_attributes' => $item->variant_attributes,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'line_total' => $item->line_total,
                    'image_url' => $item->image_path,
                ]),
            ],
            'estimatedDelivery' => $order->city === 'Inside Dhaka'
                ? (string) $this->settingService->get('estimated_delivery_inside', '24 - 48 Hours')
                : (string) $this->settingService->get('estimated_delivery_outside', '3 - 5 Days'),
        ]);
    }
}
