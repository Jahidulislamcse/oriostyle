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
                'title' => 'Glorious 10 Years',
                'subtitle' => 'Purpose & Style with Premium Quality',
                'badge_text' => 'ANNIVERSARY',
                'button_text' => 'EXPLORE NOW',
                'link_url' => '/#new-arrivals',
                'image_path' => '/storefront/img/hero/2.jpg',
                'type' => 'hero',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Premium Dawah Collection',
                'subtitle' => 'Elevate your everyday look with modern thobes and shirts',
                'badge_text' => 'NEW DROP',
                'button_text' => 'SHOP DAWAH',
                'link_url' => '/#featured-products',
                'image_path' => '/storefront/img/hero/1.jpg',
                'type' => 'hero',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Signature Accessories',
                'subtitle' => 'Special suede visor caps and essential accessories',
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
                'subtitle' => 'Exclusive Luxury Thobes & Jubbas crafted for modesty and distinction.',
                'badge_text' => 'SUMMER COLLECTION',
                'button_text' => 'EXPLORE COLLECTION',
                'link_url' => '/#featured-products',
                'image_path' => '/storefront/img/hero/2.jpg',
                'type' => 'split',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'URBAN MODESTY',
                'subtitle' => 'Contemporary drop-shoulder tees and everyday essentials with premium cotton.',
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
