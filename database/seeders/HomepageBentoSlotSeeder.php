<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomepageBentoSlot;
use Illuminate\Database\Seeder;

class HomepageBentoSlotSeeder extends Seeder
{
    /**
     * Seed initial 10 Bento mosaic slots with category associations and optimized aspect ratios.
     */
    public function run(): void
    {
        $categoriesBySlug = Category::all()->keyBy('slug');

        $slots = [
            [
                'slot_key' => 'top_left_tall',
                'category_slug' => 'mens-formal-shirts',
                'title' => 'FORMAL SHIRTS',
                'image_path' => '/storefront/img/category/1.jpg',
                'aspect_ratio' => 'tall',
                'recommended_dimensions' => '600 × 780px (Portrait)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 1,
            ],
            [
                'slot_key' => 'top_mid_upper_half',
                'category_slug' => 'womens-sarees-traditional',
                'title' => 'SAREES & TRADITIONAL',
                'image_path' => '/storefront/img/category/2.jpg',
                'aspect_ratio' => 'half',
                'recommended_dimensions' => '600 × 375px (Landscape)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 2,
            ],
            [
                'slot_key' => 'top_mid_lower_half',
                'category_slug' => 'luxury-timepieces',
                'title' => 'LUXURY TIMEPIECES',
                'image_path' => '/storefront/img/category/4.jpg',
                'aspect_ratio' => 'half',
                'recommended_dimensions' => '600 × 375px (Landscape)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 3,
            ],
            [
                'slot_key' => 'top_right_tall',
                'category_slug' => 'leather-wallets-belts',
                'title' => "MEN'S LEATHER BELTS",
                'image_path' => '/storefront/img/category/3.jpg',
                'aspect_ratio' => 'tall',
                'recommended_dimensions' => '600 × 780px (Portrait)',
                'has_arrow' => true,
                'dark_badge' => false,
                'display_order' => 4,
            ],
            [
                'slot_key' => 'mid_wide_left',
                'category_slug' => 'womens-kurtis-tunics',
                'title' => 'KURTIS & TUNICS',
                'image_path' => '/storefront/img/category/5.jpg',
                'aspect_ratio' => 'wide',
                'recommended_dimensions' => '900 × 450px (Panorama)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 5,
            ],
            [
                'slot_key' => 'mid_wide_right',
                'category_slug' => 'womens-handbags-clutches',
                'title' => 'HANDBAGS & CLUTCHES',
                'image_path' => '/storefront/img/category/7.jpg',
                'aspect_ratio' => 'wide',
                'recommended_dimensions' => '900 × 450px (Panorama)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 6,
            ],
            [
                'slot_key' => 'bot_left_tall',
                'category_slug' => 'mens-panjabi-ethnic',
                'title' => 'PLATINUM PANJABI',
                'image_path' => '/storefront/img/category/6.jpg',
                'aspect_ratio' => 'tall',
                'recommended_dimensions' => '600 × 780px (Portrait)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 7,
            ],
            [
                'slot_key' => 'bot_mid_upper_half',
                'category_slug' => 'mens-polo-t-shirts',
                'title' => 'SIGNATURE POLO',
                'image_path' => '/storefront/img/category/8.jpg',
                'aspect_ratio' => 'half',
                'recommended_dimensions' => '600 × 375px (Landscape)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 8,
            ],
            [
                'slot_key' => 'bot_mid_lower_half',
                'category_slug' => 'mens-formal-shoes',
                'title' => "MEN'S FORMAL SHOES",
                'image_path' => '/storefront/img/category/9.jpg',
                'aspect_ratio' => 'half',
                'recommended_dimensions' => '600 × 375px (Landscape)',
                'has_arrow' => true,
                'dark_badge' => true,
                'display_order' => 9,
            ],
            [
                'slot_key' => 'bot_right_tall',
                'category_slug' => 'casual-sneakers',
                'title' => 'CASUAL SNEAKERS',
                'image_path' => '/storefront/img/category/10.jpg',
                'aspect_ratio' => 'tall',
                'recommended_dimensions' => '600 × 780px (Portrait)',
                'has_arrow' => false,
                'dark_badge' => false,
                'display_order' => 10,
            ],
        ];

        foreach ($slots as $slotDef) {
            $cat = $categoriesBySlug->get($slotDef['category_slug']);

            HomepageBentoSlot::updateOrCreate(
                ['slot_key' => $slotDef['slot_key']],
                [
                    'category_id' => $cat?->id,
                    'title' => $slotDef['title'],
                    'image_path' => $slotDef['image_path'],
                    'aspect_ratio' => $slotDef['aspect_ratio'],
                    'recommended_dimensions' => $slotDef['recommended_dimensions'],
                    'has_arrow' => $slotDef['has_arrow'],
                    'dark_badge' => $slotDef['dark_badge'],
                    'is_active' => true,
                    'display_order' => $slotDef['display_order'],
                ]
            );
        }
    }
}
