<?php

namespace App\Services\Storefront;

use App\Models\Coupon;
use App\Models\User;
use Carbon\Carbon;

class CouponValidationService
{
    /**
     * Validate coupon eligibility against cart subtotal, dates, and usage limits.
     *
     * @return array{
     *     valid: bool,
     *     coupon: ?Coupon,
     *     discount: float,
     *     message: string,
     *     error: ?string
     * }
     */
    public function validate(
        string $code,
        float $subtotal,
        ?User $user = null,
        ?string $customerEmail = null
    ): array {
        $cleanCode = strtoupper(trim($code));

        if (empty($cleanCode)) {
            return [
                'valid' => false,
                'coupon' => null,
                'discount' => 0.00,
                'message' => 'Please enter a coupon code.',
                'error' => 'Please enter a coupon code.',
            ];
        }

        /** @var Coupon|null $coupon */
        $coupon = Coupon::where('code', $cleanCode)->first();

        if (!$coupon) {
            return [
                'valid' => false,
                'coupon' => null,
                'discount' => 0.00,
                'message' => 'Coupon code "' . $cleanCode . '" is invalid.',
                'error' => 'Coupon code "' . $cleanCode . '" is invalid.',
            ];
        }

        if (!$coupon->is_active) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount' => 0.00,
                'message' => 'This coupon is no longer active.',
                'error' => 'This coupon is no longer active.',
            ];
        }

        $now = Carbon::now();
        if ($coupon->start_date && $now->lt($coupon->start_date)) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount' => 0.00,
                'message' => 'This coupon is not active yet.',
                'error' => 'This coupon is not active yet.',
            ];
        }

        if ($coupon->end_date && $now->gt($coupon->end_date)) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount' => 0.00,
                'message' => 'This coupon expired on ' . $coupon->end_date->format('M d, Y') . '.',
                'error' => 'This coupon expired on ' . $coupon->end_date->format('M d, Y') . '.',
            ];
        }

        if ($coupon->isTotalUsageLimitExceeded()) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount' => 0.00,
                'message' => 'This coupon has reached its maximum redemption limit.',
                'error' => 'This coupon has reached its maximum redemption limit.',
            ];
        }

        if ($coupon->isUserUsageLimitExceeded($user, $customerEmail)) {
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount' => 0.00,
                'message' => 'You have already reached the maximum usage limit for this coupon.',
                'error' => 'You have already reached the maximum usage limit for this coupon.',
            ];
        }

        if ($subtotal < (float) $coupon->min_order_amount) {
            $formattedMin = number_format($coupon->min_order_amount, 2);
            return [
                'valid' => false,
                'coupon' => $coupon,
                'discount' => 0.00,
                'message' => "Minimum order amount of ৳{$formattedMin} required to apply this coupon.",
                'error' => "Minimum order amount of ৳{$formattedMin} required to apply this coupon.",
            ];
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $discount,
            'message' => 'Coupon "' . $coupon->code . '" applied successfully!',
            'error' => null,
        ];
    }
}
