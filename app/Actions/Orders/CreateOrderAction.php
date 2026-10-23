<?php

namespace App\Actions\Orders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Settings\SettingService;
use App\Services\Storefront\CouponValidationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateOrderAction
{
    public function __construct(
        protected CouponValidationService $couponService,
        protected SettingService $settingService
    ) {}

    /**
     * Execute the atomic order creation from cart and validated checkout payload.
     *
     * @param Cart $cart
     * @param array $payload
     * @param User|null $user
     * @return Order
     *
     * @throws ValidationException
     */
    public function execute(Cart $cart, array $payload, ?User $user = null): Order
    {
        // 1. Eager load cart relations to prevent N+1 queries
        $cart->load([
            'items.product.primaryImage',
            'items.variant',
        ]);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Your shopping bag is empty. Please add items before placing an order.'],
            ]);
        }

        // 2. Validate stock availability for all items before initiating transaction
        foreach ($cart->items as $item) {
            $availableStock = $item->variant
                ? (int) $item->variant->stock_quantity
                : (int) $item->product->stock_quantity;

            if ($availableStock < $item->quantity) {
                $name = $item->product_name . ($item->variant_summary ? " ({$item->variant_summary})" : '');
                throw ValidationException::withMessages([
                    'stock' => ["Insufficient stock for '{$name}'. Available: {$availableStock}, Requested: {$item->quantity}."],
                ]);
            }
        }

        // 3. Atomic Database Transaction with retry attempts
        return DB::transaction(function () use ($cart, $payload, $user) {
            $subtotal = (float) $cart->items->sum('line_total');

            // 4. Calculate coupon discount if applicable
            $discountAmount = 0.00;
            $appliedCoupon = null;

            if (!empty($cart->coupon_code)) {
                $validation = $this->couponService->validate(
                    $cart->coupon_code,
                    $subtotal,
                    $user ?? $cart->user
                );

                if ($validation['valid'] && $validation['coupon']) {
                    $appliedCoupon = $validation['coupon'];
                    $discountAmount = (float) $validation['discount'];
                }
            }

            // 5. Calculate shipping charges based on delivery zone and free shipping threshold
            $deliveryZone = $payload['delivery_zone'] ?? 'inside_dhaka';
            $freeShippingThreshold = (float) $this->settingService->get('free_shipping_threshold', 2000.00);

            if ($subtotal >= $freeShippingThreshold) {
                $shippingCharge = 0.00;
            } elseif ($deliveryZone === 'inside_dhaka') {
                $shippingCharge = (float) $this->settingService->get('shipping_charge_inside', 70.00);
            } else {
                $shippingCharge = (float) $this->settingService->get('shipping_charge_outside', 130.00);
            }

            $totalAmount = max(0.00, round(($subtotal - $discountAmount) + $shippingCharge, 2));

            // 6. Generate unique order number with setting prefix
            $prefix = (string) $this->settingService->get('order_prefix', 'ORD-');
            $orderNumber = $this->generateUniqueOrderNumber($prefix);

            // 7. Map city representation
            $cityName = $payload['city'] ?? ($deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka');

            // 8. Create the Order header
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user?->id ?? $cart->user_id,
                'customer_name' => trim($payload['customer_name']),
                'customer_email' => !empty($payload['customer_email']) ? trim($payload['customer_email']) : null,
                'customer_phone' => trim($payload['customer_phone']),
                'shipping_address' => trim($payload['shipping_address']),
                'city' => $cityName,
                'zone' => $payload['zone'] ?? ($deliveryZone === 'inside_dhaka' ? 'Dhaka City' : 'Outside Dhaka'),
                'postal_code' => $payload['postal_code'] ?? null,
                'payment_method' => $payload['payment_method'] ?? Order::METHOD_COD,
                'payment_status' => Order::PAYMENT_UNPAID,
                'order_status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'shipping_charge' => $shippingCharge,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'currency' => (string) $this->settingService->get('default_currency_code', 'BDT'),
                'customer_notes' => !empty($payload['customer_notes']) ? trim($payload['customer_notes']) : null,
                'admin_notes' => null,
            ]);

            // 9. Create Order Items & Decrement Inventory Atomically
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $variant = $cartItem->variant;
                $qty = (int) $cartItem->quantity;

                // Create snapshot line item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'product_sku' => $variant?->sku ?? $product->sku,
                    'variant_attributes' => $variant?->attributes ?? null,
                    'unit_price' => $cartItem->unit_price,
                    'quantity' => $qty,
                    'line_total' => $cartItem->line_total,
                    'image_path' => $cartItem->image_url,
                ]);

                // Atomically decrement stock
                $currentStock = $variant ? (int) $variant->stock_quantity : (int) $product->stock_quantity;
                $newStock = max(0, $currentStock - $qty);

                if ($variant) {
                    $variant->stock_quantity = $newStock;
                    $variant->save();

                    // Resynchronize parent product stock
                    $product->stock_quantity = (int) $product->variants()
                        ->where('is_active', true)
                        ->sum('stock_quantity');
                    $product->save();
                } else {
                    $product->stock_quantity = $newStock;
                    $product->save();
                }

                // Log immutable inventory movement
                $unitCost = (float) ($product->cost_price ?? 0.00);
                InventoryMovement::create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'type' => InventoryMovement::TYPE_ORDER_OUT,
                    'quantity' => -$qty,
                    'quantity_before' => $currentStock,
                    'quantity_after' => $newStock,
                    'unit_cost' => $unitCost,
                    'total_cost' => round($qty * $unitCost, 2),
                    'reason' => "Customer Order Placement ({$order->order_number})",
                    'reference_type' => 'order',
                    'reference_id' => $order->id,
                    'notes' => "Placed by {$order->customer_name} ({$order->customer_phone})",
                    'created_by' => $user?->id,
                ]);
            }

            // 10. Update coupon usage count if used
            if ($appliedCoupon) {
                $appliedCoupon->increment('times_used');
            }

            // 11. Empty cart line items and reset coupon
            $cart->items()->delete();
            $cart->coupon_code = null;
            $cart->save();

            return $order;
        }, 5);
    }

    /**
     * Generate a collision-free unique order number.
     */
    protected function generateUniqueOrderNumber(string $prefix): string
    {
        $datePart = date('ymd');

        do {
            $randomPart = strtoupper(Str::random(5));
            $candidate = "{$prefix}{$datePart}-{$randomPart}";
        } while (Order::where('order_number', $candidate)->exists());

        return $candidate;
    }
}
