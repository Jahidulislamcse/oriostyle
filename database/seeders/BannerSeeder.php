<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            // Hero Banners
            [
                'title' => 'ORIO STYLE Luxury Collection',
                'subtitle' => 'Elegance & Modern Distinction with Artisan Tailoring',
                'badge_text' => 'SIGNATURE',
                'button_text' => 'EXPLORE NOW',
                'link_url' => '/#new-arrivals',
                'image_path' => '/storefront/img/hero/2.jpg',
                'type' => 'hero',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'ORIO STYLE Signature Edition',
                'subtitle' => 'Elevate your wardrobe with bespoke shirts, thobes and panjabis',
                'badge_text' => 'NEW DROP',
                'button_text' => 'SHOP COLLECTION',
                'link_url' => '/#featured-products',
                'image_path' => '/storefront/img/hero/1.jpg',
                'type' => 'hero',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Signature Accessories & Caps',
                'subtitle' => 'Handcrafted leather goods, visor caps and timeless essentials',
                'badge_text' => 'ACCESSORIES',
                'button_text' => 'DISCOVER',
                'link_url' => '/#featured-products',
                'image_path' => '/storefront/img/hero/3.jpg',
                'type' => 'hero',
                'display_order' => 3,
                'is_active' => true,
            ],

            // Split Promo Banners
            [
                'title' => 'TIMELESS ELEGANCE',
                'subtitle' => 'Exclusive formal attire, luxury panjabis & tailored menswear designed for distinction.',
                'badge_text' => 'SEASONAL COLLECTION',
                'button_text' => 'EXPLORE COLLECTION',
                'link_url' => '/#featured-products',
                'image_path' => '/storefront/img/hero/2.jpg',
                'type' => 'split',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'URBAN SOPHISTICATION',
                'subtitle' => 'Contemporary drop-shoulder tees and everyday essentials crafted from organic combed cotton.',
                'badge_text' => 'NEW ARRIVALS',
                'button_text' => 'SHOP NOW',
                'link_url' => '/#featured-products',
                'image_path' => '/storefront/img/hero/1.jpg',
                'type' => 'split',
                'display_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                ['title' => $banner['title'], 'type' => $banner['type']],
                $banner
            );
        }
    }
}
