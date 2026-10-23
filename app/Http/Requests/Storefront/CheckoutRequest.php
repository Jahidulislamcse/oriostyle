<?php

namespace App\Http\Requests\Storefront;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $allowedPaymentMethods = array_keys(Order::PAYMENT_METHODS);

        return [
            'customer_name' => ['required', 'string', 'min:2', 'max:100'],
            'customer_phone' => ['required', 'string', 'min:10', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:150'],
            'shipping_address' => ['required', 'string', 'min:5', 'max:1000'],
            'delivery_zone' => ['required', 'string', 'in:inside_dhaka,outside_dhaka'],
            'city' => ['nullable', 'string', 'max:100'],
            'zone' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'payment_method' => ['required', 'string', 'in:' . implode(',', $allowedPaymentMethods)],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Please provide your full recipient name.',
            'customer_phone.required' => 'A valid mobile phone number is required for delivery.',
            'shipping_address.required' => 'Please provide your complete shipping delivery address.',
            'delivery_zone.required' => 'Please select whether your delivery location is inside or outside Dhaka.',
            'payment_method.required' => 'Please select your preferred payment method.',
            'payment_method.in' => 'Selected payment method is currently unsupported.',
        ];
    }
}
