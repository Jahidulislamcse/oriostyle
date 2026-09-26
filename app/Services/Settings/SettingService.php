<?php

namespace App\Services\Settings;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class SettingService
{
    public const CACHE_KEY = 'app_settings_public';

    /**
     * Default platform fallback settings.
     */
    public const DEFAULTS = [
        // Brand & Identity
        'site_name' => 'ORIO STYLE',
        'site_tagline' => 'Enterprise Single-Vendor E-Commerce Platform',
        'site_logo' => null,
        'site_logo_white' => null,
        'site_favicon' => null,
        'copyright_text' => '© 2026 ORIO STYLE. All rights reserved.',
        
        // Contact & Support
        'support_phone' => '+880 1700-000000',
        'whatsapp_number' => '+880 1700-000000',
        'support_email' => 'support@orio.com',
        'store_address' => 'Dhaka, Bangladesh',
        'google_map_url' => '',
        
        // Commerce & Currency
        'currency_symbol' => '৳',
        'currency_code' => 'BDT',
        'currency_position' => 'left', // left or right
        'vat_percentage' => 0.00,
        'shipping_charge_inside' => 70.00,
        'shipping_charge_outside' => 130.00,
        'free_shipping_threshold' => 2000.00,
        'low_stock_threshold' => 5,
        
        // Invoicing & Tax
        'legal_company_name' => 'ORIO STYLE E-Commerce Ltd.',
        'tax_bin_number' => 'BIN-009823412',
        'invoice_footer_notes' => 'Thank you for shopping with ORIO STYLE! Goods once sold can be exchanged within 7 days.',
        
        // Social Media
        'facebook_url' => 'https://facebook.com',
        'instagram_url' => 'https://instagram.com',
        'youtube_url' => 'https://youtube.com',
        'tiktok_url' => 'https://tiktok.com',
        'twitter_url' => 'https://twitter.com',
        'linkedin_url' => 'https://linkedin.com',
    ];

    /**
     * Retrieve all public settings with high-performance caching.
     *
     * @return array<string, mixed>
     */
    public function getAllPublicCached(): array
    {
        // Guard if table does not exist during initial bootstrap
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
        $stringValue = is_array($value) ? json_encode($value) : (string) $value;

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
    public function setMany(array $settings, string $group = 'general'): void
    {
        foreach ($settings as $key => $value) {
            $type = match (true) {
                is_bool($value) => 'boolean',
                is_int($value) => 'integer',
                is_float($value) => 'float',
                is_array($value) => 'json',
                default => 'string',
            };

            $stringValue = is_array($value) ? json_encode($value) : (string) $value;

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
     * Clear settings cache.
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
