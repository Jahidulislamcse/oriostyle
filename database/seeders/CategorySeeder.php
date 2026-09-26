<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoriesData = [
            [
                'name' => "Men's Fashion",
                'slug' => 'mens-fashion',
                'icon' => 'Shirt',
                'description' => 'Premium formal, casual and ethnic clothing crafted for men.',
                'display_order' => 1,
                'is_active' => true,
                'is_featured' => true,
                'children' => [
                    [
                        'name' => 'Formal Shirts',
                        'slug' => 'mens-formal-shirts',
                        'description' => 'Tailored executive and office wear shirts in cotton and linen.',
                        'display_order' => 1,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                    [
                        'name' => 'Casual Shirts',
                        'slug' => 'mens-casual-shirts',
                        'description' => 'Comfortable daily wear checks, prints, and solids.',
                        'display_order' => 2,
                        'is_active' => true,
                        'is_featured' => false,
                    ],
                    [
                        'name' => 'Polo & T-Shirts',
                        'slug' => 'mens-polo-t-shirts',
                        'description' => 'Premium combed cotton t-shirts and pique polo collared shirts.',
                        'display_order' => 3,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                    [
                        'name' => 'Denim & Trousers',
                        'slug' => 'mens-denim-trousers',
                        'description' => 'Classic denim jeans, chinos, and slim-fit formal trousers.',
                        'display_order' => 4,
                        'is_active' => true,
                        'is_featured' => false,
                    ],
                    [
                        'name' => 'Panjabi & Ethnic',
                        'slug' => 'mens-panjabi-ethnic',
                        'description' => 'Festive embroidered and semi-pure jacquard silk panjabis.',
                        'display_order' => 5,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                ],
            ],
            [
                'name' => "Women's Fashion",
                'slug' => 'womens-fashion',
                'icon' => 'Sparkles',
                'description' => 'Elegant traditional, ethnic and western collection for women.',
                'display_order' => 2,
                'is_active' => true,
                'is_featured' => true,
                'children' => [
                    [
                        'name' => 'Sarees & Traditional',
                        'slug' => 'womens-sarees-traditional',
                        'description' => 'Pure silk, georgette, jamdani, and designer party sarees.',
                        'display_order' => 1,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                    [
                        'name' => 'Kurtis & Tunics',
                        'slug' => 'womens-kurtis-tunics',
                        'description' => 'Comfortable cotton kurtis and designer ethnic tunics.',
                        'display_order' => 2,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                    [
                        'name' => 'Salwar Kameez & Suits',
                        'slug' => 'womens-salwar-kameez',
                        'description' => 'Three-piece stitched and unstitched luxury lawn collections.',
                        'display_order' => 3,
                        'is_active' => true,
                        'is_featured' => false,
                    ],
                    [
                        'name' => 'Handbags & Clutches',
                        'slug' => 'womens-handbags-clutches',
                        'description' => 'Leather totes, crossbody bags, and evening clutches.',
                        'display_order' => 4,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                ],
            ],
            [
                'name' => 'Footwear',
                'slug' => 'footwear',
                'icon' => 'Footprints',
                'description' => 'High-comfort leather shoes, casual sneakers, and ethnic loafers.',
                'display_order' => 3,
                'is_active' => true,
                'is_featured' => true,
                'children' => [
                    [
                        'name' => "Men's Formal Shoes",
                        'slug' => 'mens-formal-shoes',
                        'description' => 'Genuine leather oxfords, derbies, and monk straps.',
                        'display_order' => 1,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                    [
                        'name' => 'Casual Sneakers',
                        'slug' => 'casual-sneakers',
                        'description' => 'Breathable street sneakers and athletic sports shoes.',
                        'display_order' => 2,
                        'is_active' => true,
                        'is_featured' => false,
                    ],
                    [
                        'name' => "Women's Heels & Flats",
                        'slug' => 'womens-heels-flats',
                        'description' => 'Block heels, stilettos, and comfort daily flats.',
                        'display_order' => 3,
                        'is_active' => true,
                        'is_featured' => false,
                    ],
                ],
            ],
            [
                'name' => 'Accessories & Watches',
                'slug' => 'accessories-watches',
                'icon' => 'Watch',
                'description' => 'Curated collection of watches, belts, wallets, and sunglasses.',
                'display_order' => 4,
                'is_active' => true,
                'is_featured' => false,
                'children' => [
                    [
                        'name' => 'Luxury Timepieces',
                        'slug' => 'luxury-timepieces',
                        'description' => 'Chronograph quartz and automatic watches.',
                        'display_order' => 1,
                        'is_active' => true,
                        'is_featured' => true,
                    ],
                    [
                        'name' => 'Leather Wallets & Belts',
                        'slug' => 'leather-wallets-belts',
                        'description' => 'Top-grain leather bi-fold wallets and reversible belts.',
                        'display_order' => 2,
                        'is_active' => true,
                        'is_featured' => false,
                    ],
                ],
            ],
        ];

        foreach ($categoriesData as $rootData) {
            $children = $rootData['children'] ?? [];
            unset($rootData['children']);

            $rootCategory = Category::updateOrCreate(
                ['slug' => $rootData['slug']],
                $rootData
            );

            foreach ($children as $childData) {
                $childData['parent_id'] = $rootCategory->id;
                Category::updateOrCreate(
                    ['slug' => $childData['slug']],
                    $childData
                );
            }
        }
    }
}
