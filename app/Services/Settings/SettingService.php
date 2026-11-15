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

        // 8. Quick Links & Public Page URLs
        'link_track_order' => '/track-order',
        'link_store_locator' => '/store-locator',
        'link_about_us' => '/about-us',
        'link_blogs' => '/blogs',
        'link_terms' => '/terms-of-service',
        'link_privacy' => '/privacy-policy',
        'link_refund' => '/refund-policy',

        // 9. About Us Page Content
        'about_title' => 'About ORIO STYLE',
        'about_subtitle' => 'Crafting Contemporary Elegance & Everyday Luxury',
        'about_content' => "Founded with a singular vision to redefine luxury fashion in Bangladesh, ORIO STYLE blends heritage tailoring with modern, forward-thinking silhouettes.\n\nEach garment is an embodiment of precision—from hand-selected Egyptian Giza cottons to rich jacquard silks and authentic selvedge denim. We believe luxury should be tactile, enduring, and effortlessly versatile, designed for the discerning individual who appreciates subtle sophistication over fleeting trends.",
        'about_mission' => 'To deliver uncompromising sartorial excellence and authentic contemporary design, empowering our patrons to express understated elegance with confidence.',
        'about_vision' => 'To become South Asia’s benchmark luxury lifestyle house, celebrated globally for ethical craftsmanship, fabric innovation, and timeless sophistication.',

        // 10. Store Locator Page Content
        'store_locator_title' => 'Flagship Stores & Studios',
        'store_locator_subtitle' => 'Experience ORIO STYLE collections in person at our bespoke retail spaces and studios.',
        'store_locator_map_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.0474775463456!2d90.40428357597148!3d23.781320387570415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c0c0587b1%3A0xc48c08182741d40c!2sBanani%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd',
        'store_locations' => '[{"name":"Banani Flagship Studio","address":"House #12, Road #04, Block-B, Banani, Dhaka-1213","phone":"+880 1700-000001","hours":"Sat - Thu: 10:00 AM - 10:00 PM | Fri: 3:00 PM - 10:00 PM","status":"Open Today"},{"name":"Dhanmondi Experience Centre","address":"Plot #27, Road #16 (New), Dhanmondi, Dhaka-1209","phone":"+880 1700-000002","hours":"Sat - Thu: 10:00 AM - 10:00 PM | Fri: 3:00 PM - 10:00 PM","status":"Open Today"},{"name":"Uttara Retail Lounge","address":"Sector #03, Rabindra Sarani, Uttara, Dhaka-1230","phone":"+880 1700-000003","hours":"Sat - Thu: 10:00 AM - 10:00 PM | Fri: 3:00 PM - 10:00 PM","status":"Open Today"}]',

        // 11. Blogs & Editorial Content
        'blogs_title' => 'ORIO Journal & Style Editorial',
        'blogs_subtitle' => 'Curated narratives on luxury tailoring, seasonal styling inspiration, and textile craftsmanship.',
        'blog_posts' => '[{"id":1,"title":"The Architecture of the Perfect Executive Shirt","category":"Tailoring & Craft","read_time":"4 min read","date":"Nov 12, 2026","image":"/storefront/img/blog/1.jpg","excerpt":"An insider look into collar spread geometry, French plackets, and 120s two-ply Egyptian cotton weaves that define boardroom dominance.","content":"A luxury shirt is not merely stitched; it is engineered. The collar structure must retain its posture under a tailored blazer without wilting. At ORIO STYLE, we utilize high-density interlinings and genuine mother-of-pearl buttons, ensuring every shirt maintains its crisp architecture through countless executive meetings."},{"id":2,"title":"Festive Elegance: The Heritage of Jacquard Silk Panjabi","category":"Ethnic Couture","read_time":"5 min read","date":"Nov 08, 2026","image":"/storefront/img/blog/2.jpg","excerpt":"Exploring how traditional jacquard handloom motifs merge with contemporary slim-cut silhouettes for modern celebrations.","content":"The traditional Panjabi has evolved into a global symbol of refined ethnic luxury. By combining lightweight semi-pure silk jacquard with subtle metallic threadwork along the placket, ORIO STYLE Panjabis offer royal distinction while keeping you comfortable through extended festive evenings."},{"id":3,"title":"Caring for Selvedge Denim & Premium Natural Cottons","category":"Fabric Care Guide","read_time":"3 min read","date":"Nov 02, 2026","image":"/storefront/img/blog/3.jpg","excerpt":"Essential care rules from our textile experts to preserve natural indigo dyes and ensure your wardrobe lasts a decade.","content":"Raw and selvedge denim molds to your lifestyle over time, developing unique honeycombs and whiskers. Always wash inside out with cold water and mild detergent. Avoid machine drying; instead, hang dry in a shaded, well-ventilated space to preserve fabric tension and color brilliance."}]',

        // 12. Legal & Policy Pages
        'terms_title' => 'Terms of Service',
        'terms_content' => "Welcome to ORIO STYLE LTD (\"ORIO STYLE\", \"we\", \"us\", or \"our\"). By accessing or using our website (oriostyle.shop), mobile services, or purchasing products from us, you agree to be bound by these Terms of Service.\n\n1. Account & Security\nWhen creating an account, you agree to provide true, accurate, and complete information. You are solely responsible for maintaining the confidentiality of your account credentials.\n\n2. Product Information & Pricing\nWe strive to display product colors, textures, and details with maximum fidelity. However, screen calibration may vary. All prices are stated in Bangladeshi Taka (BDT) and are inclusive or exclusive of VAT as specified at checkout.\n\n3. Orders & Cancellations\nAn order confirmation represents acknowledgment of receipt, not acceptance. ORIO STYLE reserves the right to cancel or limit quantities due to unforeseen stock discrepancies or suspected fraudulent activity.\n\n4. Intellectual Property\nAll designs, logos, lookbooks, photography, typography, and copy appearing on this platform are exclusive intellectual property of ORIO STYLE LTD. Unauthorized reproduction is strictly prohibited.\n\n5. Governing Law\nThese terms are governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any dispute arising shall be subject to the exclusive jurisdiction of the courts in Dhaka, Bangladesh.",

        'privacy_title' => 'Privacy Policy',
        'privacy_content' => "At ORIO STYLE LTD, protecting your privacy and safeguarding your personal data is a foundational commitment.\n\n1. Information We Collect\nWe collect personal details you provide during registration, order checkout, and support interactions, including your name, delivery address, phone number, and email. We do not store full credit card credentials on our servers; payments are processed securely through certified PCI-DSS compliant gateways.\n\n2. How We Use Your Data\nYour data is utilized strictly to fulfill your orders, provide dispatch tracking updates via SMS and email, prevent fraudulent transactions, and—with your consent—deliver personalized fashion edits and seasonal lookbooks.\n\n3. Third-Party Sharing\nWe share customer data only with trusted logistics partners (for parcel delivery) and payment gateways (for transaction processing). We never sell, rent, or trade your personal information to third-party advertisers.\n\n4. Cookies & Analytics\nWe use essential cookies to maintain your shopping bag and session. Aggregated, anonymized browsing metrics help us improve website performance and user experience.\n\n5. Your Privacy Rights\nYou have the right to inspect, update, or request the deletion of your personal data at any time by contacting our privacy officer at privacy@oriostyle.com.",

        'refund_title' => 'Refund, Return & Exchange Policy',
        'refund_content' => "At ORIO STYLE, we take immense pride in the craftsmanship and quality of our garments. If an item does not meet your expectations, we offer a hassle-free 7-day exchange and refund policy.\n\n1. 7-Day Exchange Window\nYou may request an exchange for size, color, or a different style within 7 calendar days of receiving your parcel. The garment must be unworn, unwashed, unaltered, and accompanied by original tags and invoice.\n\n2. Eligibility for Returns & Refunds\nReturns are accepted for:\n• Size or fitting mismatch\n• Defective or damaged items upon arrival\n• Incorrect product dispatched\nCustom-tailored or altered garments and intimate undergarments are non-refundable unless verified defective upon delivery.\n\n3. Refund Processing Timeline\nOnce your return is received and inspected at our Dhaka Quality Centre:\n• Mobile Financial Services (bKash/Nagad): 24 to 48 hours\n• Debit / Credit Card refunds: 5 to 10 working days (depending on your issuing bank)\n• Cash on Delivery orders: Refunded via bKash, bank transfer, or store credit voucher per your preference.\n\n4. Doorstep Exchange & Support\nFor instant exchange assistance within Dhaka metro, our courier can deliver your replacement size while picking up the returned item. Contact our support team via WhatsApp or call +880 1700-000000.",

        // 13. Dynamic Offer Popup
        'popup_enabled' => false,
        'popup_product_id' => null,
        'popup_title' => 'EXCLUSIVE SPECIAL OFFER',
        'popup_subtitle' => 'Unlock a limited-time luxury discount on our handcrafted signature piece!',
        'popup_badge_text' => 'FLASH DEAL',
        'popup_coupon_code' => 'ORIO10',
        'popup_button_text' => 'Claim Offer Now',
        'popup_delay_seconds' => 3,
        'popup_show_once_per_session' => true,
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
        'pages' => [
            'link_track_order', 'link_store_locator', 'link_about_us', 'link_blogs', 'link_terms', 'link_privacy', 'link_refund',
            'about_title', 'about_subtitle', 'about_content', 'about_mission', 'about_vision',
            'store_locator_title', 'store_locator_subtitle', 'store_locator_map_embed', 'store_locations',
            'blogs_title', 'blogs_subtitle', 'blog_posts',
            'terms_title', 'terms_content',
            'privacy_title', 'privacy_content',
            'refund_title', 'refund_content',
        ],
        'popup' => [
            'popup_enabled', 'popup_product_id', 'popup_title', 'popup_subtitle',
            'popup_badge_text', 'popup_coupon_code', 'popup_button_text',
            'popup_delay_seconds', 'popup_show_once_per_session',
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
        $inferredType = $this->determineTypeForKey($key, $value);
        if ($type === 'string' && $inferredType !== 'string') {
            $type = $inferredType;
        }

        $stringValue = match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            'integer' => (is_null($value) || $value === '') ? null : (string) (int) $value,
            'float' => (is_null($value) || $value === '') ? null : (string) (float) $value,
            'json' => is_array($value) ? json_encode($value) : (string) $value,
            default => match (true) {
                is_null($value) || $value === '' => null,
                is_bool($value) => $value ? '1' : '0',
                is_array($value) => json_encode($value),
                default => (string) $value,
            },
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
            $type = $this->determineTypeForKey($key, $value);

            $stringValue = match ($type) {
                'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
                'integer' => (is_null($value) || $value === '') ? null : (string) (int) $value,
                'float' => (is_null($value) || $value === '') ? null : (string) (float) $value,
                'json' => is_array($value) ? json_encode($value) : (string) $value,
                default => match (true) {
                    is_null($value) || $value === '' => null,
                    is_bool($value) => $value ? '1' : '0',
                    is_array($value) => json_encode($value),
                    default => (string) $value,
                },
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
     * Determine database type column based on setting key or value.
     */
    public function determineTypeForKey(string $key, mixed $value = null): string
    {
        if (array_key_exists($key, self::DEFAULTS)) {
            $default = self::DEFAULTS[$key];
            if (is_bool($default)) {
                return 'boolean';
            }
            if (is_int($default)) {
                return 'integer';
            }
            if (is_float($default)) {
                return 'float';
            }
            if (is_array($default)) {
                return 'json';
            }
        }

        return $this->determineTypeForValue($value);
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
