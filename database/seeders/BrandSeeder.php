<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->ensureStorageDirectories();

        $brandsData = [
            [
                'name' => 'ORIO Exclusive',
                'slug' => 'orio-exclusive',
                'logo_file' => 'brand_orio.png',
                'badge' => 'ORIO',
                'subtext' => 'LUXURY COUTURE',
                'color' => [212, 175, 55], // Gold
                'website_url' => 'https://orio.style',
                'description' => 'Flagship signature collection of bespoke haute couture, thobes, and luxury casuals.',
                'display_order' => 1,
                'is_active' => true,
                'is_featured' => true,
                'meta_title' => 'ORIO Exclusive - Luxury Designer Fashion',
                'meta_description' => 'Shop exclusive designer apparel, thobes, and luxury apparel handcrafted by ORIO.',
            ],
            [
                'name' => 'Apex Heritage',
                'slug' => 'apex-heritage',
                'logo_file' => 'brand_apex.png',
                'badge' => 'APEX',
                'subtext' => 'FINE FOOTWEAR',
                'color' => [226, 232, 240], // Platinum Slate
                'website_url' => 'https://apexfootwear.com',
                'description' => 'Handcrafted pure leather oxfords, monk straps, derbies, and executive comfort footwear.',
                'display_order' => 2,
                'is_active' => true,
                'is_featured' => true,
                'meta_title' => 'Apex Heritage - Handcrafted Leather Shoes',
                'meta_description' => 'Executive footwear engineered with genuine top-grain calfskin leather.',
            ],
            [
                'name' => 'Aarong Tradition',
                'slug' => 'aarong-tradition',
                'logo_file' => 'brand_aarong.png',
                'badge' => 'AARONG',
                'subtext' => 'HERITAGE CRAFT',
                'color' => [245, 158, 11], // Amber
                'website_url' => 'https://aarong.com',
                'description' => 'Authentic indigenous handloom, Jamdani silk sarees, and festive embroidered ethnic panjabis.',
                'display_order' => 3,
                'is_active' => true,
                'is_featured' => true,
                'meta_title' => 'Aarong Tradition - Handcrafted Ethnic Wear',
                'meta_description' => 'Traditional sarees, pure silk panjabis, and artisanal handloom fashion.',
            ],
            [
                'name' => 'Artisan Tailors',
                'slug' => 'artisan-tailors',
                'logo_file' => 'brand_artisan.png',
                'badge' => 'ARTISAN',
                'subtext' => 'BESPOKE TAILORS',
                'color' => [56, 189, 248], // Sky Blue
                'website_url' => 'https://artisantailors.com',
                'description' => 'Masterfully tailored Giza cotton shirts, Italian wool blazers, and premium executive trousers.',
                'display_order' => 4,
                'is_active' => true,
                'is_featured' => true,
                'meta_title' => 'Artisan Tailors - Executive Formalwear',
                'meta_description' => 'Finely tailored shirts and suiting crafted for discerning executives.',
            ],
            [
                'name' => 'Ecstasy Streetwear',
                'slug' => 'ecstasy-streetwear',
                'logo_file' => 'brand_ecstasy.png',
                'badge' => 'ECSTASY',
                'subtext' => 'URBAN STREETWEAR',
                'color' => [236, 72, 153], // Pink/Magenta
                'website_url' => 'https://ecstasy.com.bd',
                'description' => 'Trendsetting street fashion, heavyweight drop-shoulder tees, raw denim, and cargo trousers.',
                'display_order' => 5,
                'is_active' => true,
                'is_featured' => true,
                'meta_title' => 'Ecstasy Streetwear - Urban Lifestyle',
                'meta_description' => 'Contemporary urban streetwear, raw selvedge denim, and graphic oversized tees.',
            ],
            [
                'name' => 'Sailor Elite',
                'slug' => 'sailor-elite',
                'logo_file' => 'brand_sailor.png',
                'badge' => 'SAILOR',
                'subtext' => 'SMART CASUALS',
                'color' => [96, 165, 250], // Soft Blue
                'website_url' => 'https://sailor.clothing',
                'description' => 'Modern lifestyle apparel featuring premium pique knit polo shirts, linen button-downs, and casual chinos.',
                'display_order' => 6,
                'is_active' => true,
                'is_featured' => true,
                'meta_title' => 'Sailor Elite - Modern Everyday Casuals',
                'meta_description' => 'Breezy linen shirts, classic polo t-shirts, and everyday comfort trousers.',
            ],
            [
                'name' => 'Royal Chrono',
                'slug' => 'royal-chrono',
                'logo_file' => 'brand_chrono.png',
                'badge' => 'CHRONO',
                'subtext' => 'ROYAL TIMEPIECES',
                'color' => [212, 175, 55], // Gold
                'website_url' => 'https://royalchrono.luxury',
                'description' => 'Swiss-inspired automatic chronographs, sapphire crystal watches, and luxury stainless steel timepieces.',
                'display_order' => 7,
                'is_active' => true,
                'is_featured' => false,
                'meta_title' => 'Royal Chrono - Precision Horology',
                'meta_description' => 'Exclusive automatic and chronograph watches with sapphire crystal glass.',
            ],
            [
                'name' => 'LeatherCraft Guild',
                'slug' => 'leathercraft-guild',
                'logo_file' => 'brand_leathercraft.png',
                'badge' => 'LEATHER',
                'subtext' => 'GUILD ACCESSORIES',
                'color' => [251, 146, 60], // Leather Tan/Orange
                'website_url' => 'https://leathercraftguild.com',
                'description' => 'Full-grain vegetable-tanned leather bi-fold wallets, RFID-blocking cardholders, and reversible dress belts.',
                'display_order' => 8,
                'is_active' => true,
                'is_featured' => false,
                'meta_title' => 'LeatherCraft Guild - Top Grain Leather Goods',
                'meta_description' => 'Handcrafted full-grain leather wallets, belts, and luxury card holders.',
            ],
        ];

        foreach ($brandsData as $item) {
            $logoRelPath = 'brands/' . $item['logo_file'];
            $this->generateBrandLogo(
                $item['logo_file'],
                $item['badge'],
                $item['subtext'],
                $item['color']
            );

            Brand::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'name' => $item['name'],
                    'slug' => $item['slug'],
                    'logo' => $logoRelPath,
                    'website_url' => $item['website_url'],
                    'description' => $item['description'],
                    'display_order' => $item['display_order'],
                    'is_active' => $item['is_active'],
                    'is_featured' => $item['is_featured'],
                    'meta_title' => $item['meta_title'],
                    'meta_description' => $item['meta_description'],
                ]
            );
        }
    }

    /**
     * Ensure storage directories exist.
     */
    protected function ensureStorageDirectories(): void
    {
        $dirs = [
            storage_path('app/public/brands'),
            public_path('storage/brands'),
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                @mkdir($dir, 0755, true);
            }
        }
    }

    /**
     * Generate stylish PNG monogram logo card.
     */
    protected function generateBrandLogo(string $fileName, string $badge, string $subtext, array $accentRgb): void
    {
        $appPath = storage_path('app/public/brands/' . $fileName);
        $pubPath = public_path('storage/brands/' . $fileName);

        if (file_exists($appPath) && file_exists($pubPath)) {
            return;
        }

        if (!extension_loaded('gd')) {
            return;
        }

        $w = 340;
        $h = 140;
        $im = imagecreatetruecolor($w, $h);

        // Dark navy card background (#0E2038)
        $bg = imagecolorallocate($im, 14, 32, 56);
        imagefilledrectangle($im, 0, 0, $w, $h, $bg);

        // Subtle borders
        $outerBorder = imagecolorallocate($im, 28, 62, 99);
        $innerBorder = imagecolorallocate($im, 40, 80, 120);
        imagerectangle($im, 0, 0, $w - 1, $h - 1, $outerBorder);
        imagerectangle($im, 4, 4, $w - 5, $h - 5, $innerBorder);

        // Accent & text colors
        $accent = imagecolorallocate($im, $accentRgb[0], $accentRgb[1], $accentRgb[2]);
        $white = imagecolorallocate($im, 248, 250, 252);

        // Draw brand badge monogram
        imagestring($im, 5, 30, 42, $badge, $white);

        // Draw subtitle / specialty
        imagestring($im, 3, 30, 78, $subtext, $accent);

        // Draw decorative accent bar
        imagefilledrectangle($im, 30, 68, 120, 70, $accent);

        imagepng($im, $appPath);
        @copy($appPath, $pubPath);
        imagedestroy($im);
    }
}
