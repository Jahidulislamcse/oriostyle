<?php

namespace App\Services\Settings;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class SettingService
{
    public const CACHE_KEY = 'app_settings_public';

    /**
     * Default platform fallback settings.
     */
    public const DEFAULTS = [
        // 1. General & Brand Identity
        'site_name' => 'ORIO STYLE LTD',
        'site_tagline' => 'Enterprise Single-Vendor E-Commerce Platform',
        'site_logo' => null,
        'site_logo_white' => null,
        'site_favicon' => null,
        'copyright_text' => '© 2026 ORIO STYLE LTD. All rights reserved.',

        // 2. Store & Contact Details
        'support_phone' => '+880 1700-000000',
        'whatsapp_number' => '+880 1700-000000',
        'support_email' => 'support@oriostyle.com',
        'store_address' => 'House #12, Road #04, Banani, Dhaka-1213, Bangladesh',
        'google_map_url' => '',
        'business_hours' => 'Sat - Thu: 9:00 AM - 9:00 PM',

        // 3. Commerce & Currency
        'currency_symbol' => '৳',
        'currency_code' => 'BDT',
        'currency_position' => 'left', // left or right
        'low_stock_threshold' => 5,
        'timezone' => 'Asia/Dhaka',

        // 4. Shipping & Delivery
        'shipping_charge_inside' => 70.00,
        'shipping_charge_outside' => 130.00,
        'free_shipping_threshold' => 2000.00,
        'estimated_delivery_inside' => '24 - 48 Hours',
        'estimated_delivery_outside' => '3 - 5 Days',

        // 5. Checkout, Tax & Invoicing
        'vat_percentage' => 0.00,
        'vat_inclusive' => false,
        'min_order_amount' => 0.00,
        'cash_on_delivery_enabled' => true,
        'online_payment_enabled' => true,
        'order_prefix' => 'ORD-',
        'legal_company_name' => 'ORIO STYLE E-Commerce Ltd.',
        'tax_bin_number' => 'BIN-009823412',
        'invoice_footer_notes' => 'Thank you for choosing ORIO STYLE! Goods once sold can be exchanged within 7 days with original invoice.',

        // 6. Social Media & Widget
        'facebook_url' => 'https://facebook.com',
        'instagram_url' => 'https://instagram.com',
        'youtube_url' => 'https://youtube.com',
        'tiktok_url' => 'https://tiktok.com',
        'twitter_url' => 'https://twitter.com',
        'linkedin_url' => 'https://linkedin.com',
        'whatsapp_chat_enabled' => true,

        // 7. SEO & Custom Content
        'meta_title' => 'ORIO STYLE | Premium Fashion & Lifestyle',
        'meta_description' => 'Discover luxury formal wear, designer shirts, and tailored fashion crafted with premium fabrics and impeccable craftsmanship.',
        'meta_keywords' => 'fashion, clothing, luxury, men formal shirts, bangladesh ecommerce',
        'custom_header_scripts' => '',
        'custom_footer_scripts' => '',
    ];

    /**
     * Group definitions for structured settings management.
     */
    public const GROUPS = [
        'general' => [
            'site_name', 'site_tagline', 'site_logo', 'site_logo_white', 'site_favicon', 'copyright_text'
        ],
        'contact' => [
            'support_phone', 'whatsapp_number', 'support_email', 'store_address', 'google_map_url', 'business_hours'
        ],
        'commerce' => [
            'currency_symbol', 'currency_code', 'currency_position', 'low_stock_threshold', 'timezone'
        ],
        'shipping' => [
            'shipping_charge_inside', 'shipping_charge_outside', 'free_shipping_threshold', 'estimated_delivery_inside', 'estimated_delivery_outside'
        ],
        'invoicing' => [
            'vat_percentage', 'vat_inclusive', 'min_order_amount', 'cash_on_delivery_enabled', 'online_payment_enabled', 'order_prefix', 'legal_company_name', 'tax_bin_number', 'invoice_footer_notes'
        ],
        'social' => [
            'facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'twitter_url', 'linkedin_url', 'whatsapp_chat_enabled'
        ],
        'seo' => [
            'meta_title', 'meta_description', 'meta_keywords', 'custom_header_scripts', 'custom_footer_scripts'
        ],
    ];

    /**
     * Retrieve all public settings with high-performance caching.
     *
     * @return array<string, mixed>
     */
    public function getSettings(): array
    {
        return $this->getAllPublicCached();
    }

    /**
     * Retrieve all public settings with high-performance caching.
     *
     * @return array<string, mixed>
     */
    public function getAllPublicCached(): array
    {
        if (! Schema::hasTable('settings')) {
            return self::DEFAULTS;
        }

        return Cache::rememberForever(self::CACHE_KEY, function () {
            $settingsFromDb = Setting::public()->get()->mapWithKeys(function (Setting $setting) {
                return [$setting->key => $setting->formatted_value];
            })->toArray();

            return array_merge(self::DEFAULTS, $settingsFromDb);
        });
    }

    /**
     * Get a specific setting value by key with optional fallback.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $all = $this->getAllPublicCached();

        return $all[$key] ?? $default ?? (self::DEFAULTS[$key] ?? null);
    }

    /**
     * Set a setting value and invalidate cache.
     */
    public function set(string $key, mixed $value, string $group = 'general', string $type = 'string', bool $isPublic = true): Setting
    {
        $stringValue = match (true) {
            is_null($value) || $value === '' => null,
            is_bool($value) => $value ? '1' : '0',
            is_array($value) => json_encode($value),
            default => (string) $value,
        };

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'value' => $stringValue,
                'type' => $type,
                'is_public' => $isPublic,
            ]
        );

        $this->clearCache();

        return $setting;
    }

    /**
     * Set multiple settings in batch and clear cache.
     *
     * @param array<string, mixed> $settings
     */
    public function setMany(array $settings, ?string $defaultGroup = 'general'): void
    {
        foreach ($settings as $key => $value) {
            $group = $this->determineGroupForKey($key, $defaultGroup);
            $type = $this->determineTypeForValue($value);

            $stringValue = match (true) {
                is_null($value) => null,
                is_bool($value) => $value ? '1' : '0',
                is_array($value) => json_encode($value),
                default => (string) $value,
            };

            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'group' => $group,
                    'value' => $stringValue,
                    'type' => $type,
                    'is_public' => true,
                ]
            );
        }

        $this->clearCache();
    }

    /**
     * Upload a setting media file and update setting record.
     */
    public function uploadSettingFile(UploadedFile $file, string $key, string $group = 'general'): string
    {
        // Remove existing file if present
        $this->deletePhysicalFile($key);

        $extension = $file->getClientOriginalExtension() ?: 'png';
        $filename = $key . '_' . time() . '.' . $extension;
        $path = $file->storeAs('settings', $filename, 'public');

        $publicUrl = '/storage/' . $path;

        $this->set($key, $publicUrl, $group, 'image', true);

        return $publicUrl;
    }

    /**
     * Delete physical media file associated with setting.
     */
    public function deleteSettingFile(string $key): void
    {
        $this->deletePhysicalFile($key);
        $this->set($key, null, $this->determineGroupForKey($key, 'general'), 'image', true);
    }

    /**
     * Helper to safely remove file from public storage disk.
     */
    protected function deletePhysicalFile(string $key): void
    {
        $currentValue = Setting::where('key', $key)->value('value');
        if ($currentValue && str_starts_with($currentValue, '/storage/settings/')) {
            $relativePath = str_replace('/storage/', '', $currentValue);
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }
    }

    /**
     * Determine group name for a given key based on defined groups.
     */
    public function determineGroupForKey(string $key, ?string $fallback = 'general'): string
    {
        foreach (self::GROUPS as $groupName => $keys) {
            if (in_array($key, $keys, true)) {
                return $groupName;
            }
        }

        return $fallback ?? 'general';
    }

    /**
     * Determine database type column based on value.
     */
    protected function determineTypeForValue(mixed $value): string
    {
        return match (true) {
            is_bool($value) => 'boolean',
            is_int($value) => 'integer',
            is_float($value) => 'float',
            is_array($value) => 'json',
            default => 'string',
        };
    }

    /**
     * Clear settings cache.
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
