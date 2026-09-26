<?php

namespace Database\Seeders;

use App\Services\Settings\SettingService;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(SettingService $settingService): void
    {
        $settingService->setMany([
            'site_name' => 'ORIO STYLE',
            'site_tagline' => 'Enterprise Single-Vendor E-Commerce Platform',
            'copyright_text' => '© 2026 ORIO STYLE. All rights reserved.',
            'support_phone' => '+880 1700-000000',
            'whatsapp_number' => '+880 1700-000000',
            'support_email' => 'support@orio.com',
            'store_address' => 'Dhaka, Bangladesh',
            'currency_symbol' => '৳',
            'currency_code' => 'BDT',
            'currency_position' => 'left',
            'vat_percentage' => 0.00,
            'shipping_charge_inside' => 70.00,
            'shipping_charge_outside' => 130.00,
            'free_shipping_threshold' => 2000.00,
            'low_stock_threshold' => 5,
            'legal_company_name' => 'ORIO STYLE E-Commerce Ltd.',
            'tax_bin_number' => 'BIN-009823412',
            'invoice_footer_notes' => 'Thank you for shopping with ORIO STYLE! Goods once sold can be exchanged within 7 days.',
            'facebook_url' => 'https://facebook.com',
            'instagram_url' => 'https://instagram.com',
            'youtube_url' => 'https://youtube.com',
            'tiktok_url' => 'https://tiktok.com',
            'twitter_url' => 'https://twitter.com',
            'linkedin_url' => 'https://linkedin.com',
        ], 'general');
    }
}
