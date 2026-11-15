<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['super_admin', 'admin'], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // General & Brand Identity
            'site_name' => ['nullable', 'string', 'max:100'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'site_logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:3072'],
            'site_logo_white' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:3072'],
            'site_favicon' => ['nullable', 'file', 'mimes:ico,png,svg,webp,jpg,jpeg', 'max:1024'],
            'remove_site_logo' => ['nullable', 'boolean'],
            'remove_site_logo_white' => ['nullable', 'boolean'],
            'remove_site_favicon' => ['nullable', 'boolean'],
            'copyright_text' => ['nullable', 'string', 'max:255'],

            // Contact & Store Information
            'support_phone' => ['nullable', 'string', 'max:50'],
            'whatsapp_number' => ['nullable', 'string', 'max:50'],
            'support_email' => ['nullable', 'email', 'max:100'],
            'store_address' => ['nullable', 'string', 'max:500'],
            'google_map_url' => ['nullable', 'string', 'max:1000'],
            'business_hours' => ['nullable', 'string', 'max:100'],

            // Commerce & Localization
            'currency_symbol' => ['nullable', 'string', 'max:10'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'currency_position' => ['nullable', 'in:left,right'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'timezone' => ['nullable', 'string', 'max:50'],

            // Shipping & Delivery
            'shipping_charge_inside' => ['nullable', 'numeric', 'min:0'],
            'shipping_charge_outside' => ['nullable', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['nullable', 'numeric', 'min:0'],
            'estimated_delivery_inside' => ['nullable', 'string', 'max:100'],
            'estimated_delivery_outside' => ['nullable', 'string', 'max:100'],

            // Invoicing, Tax & Checkout
            'vat_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'vat_inclusive' => ['nullable', 'boolean'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'cash_on_delivery_enabled' => ['nullable', 'boolean'],
            'online_payment_enabled' => ['nullable', 'boolean'],
            'order_prefix' => ['nullable', 'string', 'max:20'],
            'legal_company_name' => ['nullable', 'string', 'max:255'],
            'tax_bin_number' => ['nullable', 'string', 'max:100'],
            'invoice_footer_notes' => ['nullable', 'string', 'max:1000'],

            // Social Media
            'facebook_url' => ['nullable', 'string', 'max:255'],
            'instagram_url' => ['nullable', 'string', 'max:255'],
            'youtube_url' => ['nullable', 'string', 'max:255'],
            'tiktok_url' => ['nullable', 'string', 'max:255'],
            'twitter_url' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'string', 'max:255'],
            'whatsapp_chat_enabled' => ['nullable', 'boolean'],

            // SEO & Metadata
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'custom_header_scripts' => ['nullable', 'string', 'max:10000'],
            'custom_footer_scripts' => ['nullable', 'string', 'max:10000'],

            // Quick Links URLs & Dynamic Public Pages
            'link_track_order' => ['nullable', 'string', 'max:255'],
            'link_store_locator' => ['nullable', 'string', 'max:255'],
            'link_about_us' => ['nullable', 'string', 'max:255'],
            'link_blogs' => ['nullable', 'string', 'max:255'],
            'link_terms' => ['nullable', 'string', 'max:255'],
            'link_privacy' => ['nullable', 'string', 'max:255'],
            'link_refund' => ['nullable', 'string', 'max:255'],

            'about_title' => ['nullable', 'string', 'max:255'],
            'about_subtitle' => ['nullable', 'string', 'max:500'],
            'about_content' => ['nullable', 'string', 'max:20000'],
            'about_mission' => ['nullable', 'string', 'max:5000'],
            'about_vision' => ['nullable', 'string', 'max:5000'],

            'store_locator_title' => ['nullable', 'string', 'max:255'],
            'store_locator_subtitle' => ['nullable', 'string', 'max:500'],
            'store_locator_map_embed' => ['nullable', 'string', 'max:5000'],
            'store_locations' => ['nullable', 'string', 'max:20000'],

            'blogs_title' => ['nullable', 'string', 'max:255'],
            'blogs_subtitle' => ['nullable', 'string', 'max:500'],
            'blog_posts' => ['nullable', 'string', 'max:50000'],

            'terms_title' => ['nullable', 'string', 'max:255'],
            'terms_content' => ['nullable', 'string', 'max:30000'],

            'privacy_title' => ['nullable', 'string', 'max:255'],
            'privacy_content' => ['nullable', 'string', 'max:30000'],

            'refund_title' => ['nullable', 'string', 'max:255'],
            'refund_content' => ['nullable', 'string', 'max:30000'],
        ];
    }
}
