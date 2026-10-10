<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = Brand::all()->keyBy('slug');
        $categories = Category::all()->keyBy('slug');

        $productsData = [
            [
                'name' => 'Royal Oxford Tailored Formal Shirt',
                'slug' => 'royal-oxford-tailored-formal-shirt',
                'sku' => 'MSH-OXF-001',
                'category_slug' => 'mens-formal-shirts',
                'brand_slug' => 'artisan-tailors',
                'short_description' => '100% two-ply Egyptian Giza cotton formal shirt with a cutaway collar and French cuffs.',
                'description' => 'Crafted from luxury long-staple cotton with a silky finish. Designed with precise structural collar stays, mother-of-pearl buttons, and reinforced side gussets for executive all-day confidence.',
                'base_price' => 3200.00,
                'sale_price' => 2650.00,
                'cost_price' => 1450.00,
                'stock_quantity' => 45,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['1.jpg', '2.jpg'],
                'variants' => [
                    ['size' => '39 (M)', 'color' => 'Crisp White', 'sku' => 'MSH-OXF-001-WHT-39', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '40 (L)', 'color' => 'Crisp White', 'sku' => 'MSH-OXF-001-WHT-40', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '42 (XL)', 'color' => 'Crisp White', 'sku' => 'MSH-OXF-001-WHT-42', 'stock' => 5, 'price_adjustment' => 100],
                    ['size' => '39 (M)', 'color' => 'Sky Blue', 'sku' => 'MSH-OXF-001-BLU-39', 'stock' => 5, 'price_adjustment' => 0],
                    ['size' => '40 (L)', 'color' => 'Sky Blue', 'sku' => 'MSH-OXF-001-BLU-40', 'stock' => 5, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Signature Pique Cotton Polo Shirt',
                'slug' => 'signature-pique-cotton-polo-shirt',
                'sku' => 'MPL-PIQ-002',
                'category_slug' => 'mens-polo-t-shirts',
                'brand_slug' => 'orio-exclusive',
                'short_description' => 'Ultra-breathable honeycomb pique cotton polo with embroidered gold chest emblem.',
                'description' => 'Premium combed cotton offering temperature control and vibrant colorfastness. Tailored regular athletic fit with ribbed collar and double-stitched sleeves.',
                'base_price' => 1850.00,
                'sale_price' => 1490.00,
                'cost_price' => 780.00,
                'stock_quantity' => 60,
                'low_stock_threshold' => 15,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['3.jpg', '5.jpg'],
                'variants' => [
                    ['size' => 'S', 'color' => 'Navy Blue', 'sku' => 'MPL-PIQ-002-NVY-S', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => 'M', 'color' => 'Navy Blue', 'sku' => 'MPL-PIQ-002-NVY-M', 'stock' => 20, 'price_adjustment' => 0],
                    ['size' => 'L', 'color' => 'Navy Blue', 'sku' => 'MPL-PIQ-002-NVY-L', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => 'XL', 'color' => 'Jet Black', 'sku' => 'MPL-PIQ-002-BLK-XL', 'stock' => 10, 'price_adjustment' => 50],
                ],
            ],
            [
                'name' => 'Hand-Embroidered Festive Silk Panjabi',
                'slug' => 'hand-embroidered-festive-silk-panjabi',
                'sku' => 'MPJ-SLK-003',
                'category_slug' => 'mens-panjabi-ethnic',
                'brand_slug' => 'aarong-tradition',
                'short_description' => 'Semi-pure jacquard silk panjabi detailed with tone-on-tone neckline zardosi needlework.',
                'description' => 'A royal attire tailored for Eid, weddings, and formal celebrations. Hand-embroidered placket with metallic carved metal buttons and breathable cotton lining.',
                'base_price' => 5800.00,
                'sale_price' => 4950.00,
                'cost_price' => 2800.00,
                'stock_quantity' => 25,
                'low_stock_threshold' => 8,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => false,
                'images' => ['6.jpg', '9.jpg'],
                'variants' => [
                    ['size' => '40 (M)', 'color' => 'Maroon Ruby', 'sku' => 'MPJ-SLK-003-MRN-40', 'stock' => 8, 'price_adjustment' => 0],
                    ['size' => '42 (L)', 'color' => 'Maroon Ruby', 'sku' => 'MPJ-SLK-003-MRN-42', 'stock' => 10, 'price_adjustment' => 0],
                    ['size' => '44 (XL)', 'color' => 'Golden Cream', 'sku' => 'MPJ-SLK-003-GLD-44', 'stock' => 7, 'price_adjustment' => 200],
                ],
            ],
            [
                'name' => 'Selvedge Slim Fit Stretch Denim',
                'slug' => 'selvedge-slim-fit-stretch-denim',
                'sku' => 'MDN-SLV-004',
                'category_slug' => 'mens-denim-trousers',
                'brand_slug' => 'ecstasy-streetwear',
                'short_description' => '13.5oz authentic indigo ring-spun denim with 2% elastane for unrestricted comfort.',
                'description' => 'Vintage stone-washed whiskers with heavy-duty copper rivets and custom leather back patch. Built for durability and all-day modern street aesthetics.',
                'base_price' => 3450.00,
                'sale_price' => 2850.00,
                'cost_price' => 1600.00,
                'stock_quantity' => 38,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => false,
                'is_new_arrival' => true,
                'images' => ['10.jpg', '11.jpg'],
                'variants' => [
                    ['size' => '30', 'color' => 'Dark Indigo', 'sku' => 'MDN-SLV-004-IND-30', 'stock' => 8, 'price_adjustment' => 0],
                    ['size' => '32', 'color' => 'Dark Indigo', 'sku' => 'MDN-SLV-004-IND-32', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '34', 'color' => 'Dark Indigo', 'sku' => 'MDN-SLV-004-IND-34', 'stock' => 10, 'price_adjustment' => 0],
                    ['size' => '36', 'color' => 'Dark Indigo', 'sku' => 'MDN-SLV-004-IND-36', 'stock' => 5, 'price_adjustment' => 100],
                ],
            ],
            [
                'name' => 'Artisanal Dhakai Jamdani Handloom Saree',
                'slug' => 'artisanal-dhakai-jamdani-handloom-saree',
                'sku' => 'WSR-JMD-005',
                'category_slug' => 'womens-sarees-traditional',
                'brand_slug' => 'aarong-tradition',
                'short_description' => 'Authentic handwoven 84-count muslin thread Jamdani with intricate floral zari motifs.',
                'description' => 'Heritage Bangladeshi craftsmanship taking 3 weeks on traditional pit looms. Featherweight draping with pure metallic golden border that defines timeless Bengali elegance.',
                'base_price' => 12500.00,
                'sale_price' => 10800.00,
                'cost_price' => 6500.00,
                'stock_quantity' => 12,
                'low_stock_threshold' => 5,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['12.jpg', '13.jpg'],
                'variants' => [
                    ['size' => 'Standard (12 Haat)', 'color' => 'Emerald Green & Gold', 'sku' => 'WSR-JMD-005-EMR', 'stock' => 7, 'price_adjustment' => 0],
                    ['size' => 'Standard (12 Haat)', 'color' => 'Crimson Red & Gold', 'sku' => 'WSR-JMD-005-RED', 'stock' => 5, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Designer Block-Printed Cotton Kurti',
                'slug' => 'designer-block-printed-cotton-kurti',
                'sku' => 'WKT-BLK-006',
                'category_slug' => 'womens-kurtis-tunics',
                'brand_slug' => 'orio-exclusive',
                'short_description' => 'Hand block-printed pure cambric cotton A-line kurti with delicate tassel tie-ups.',
                'description' => 'Breezy everyday ethnic tunic styled with side slits and round notch collar. Breathable, hypoallergenic natural dyes that retain vibrance wash after wash.',
                'base_price' => 2450.00,
                'sale_price' => 1950.00,
                'cost_price' => 950.00,
                'stock_quantity' => 40,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => false,
                'images' => ['14.jpg', '15.jpg'],
                'variants' => [
                    ['size' => '36 (S)', 'color' => 'Pastel Peach', 'sku' => 'WKT-BLK-006-PCH-36', 'stock' => 10, 'price_adjustment' => 0],
                    ['size' => '38 (M)', 'color' => 'Pastel Peach', 'sku' => 'WKT-BLK-006-PCH-38', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '40 (L)', 'color' => 'Pastel Peach', 'sku' => 'WKT-BLK-006-PCH-40', 'stock' => 15, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Luxury 3-Piece Stitched Georgette Suit',
                'slug' => 'luxury-3-piece-stitched-georgette-suit',
                'sku' => 'WSU-GRG-007',
                'category_slug' => 'womens-salwar-kameez',
                'brand_slug' => 'orio-exclusive',
                'short_description' => 'Heavy sequin and thread embroidered long kameez with matching silk trouser and organza dupatta.',
                'description' => 'Ready-to-wear formal celebration attire. Features full lining inside kameez, scolloped lace dupatta borders, and tailored cigarette trousers with elastic waistband.',
                'base_price' => 8900.00,
                'sale_price' => 7450.00,
                'cost_price' => 4100.00,
                'stock_quantity' => 18,
                'low_stock_threshold' => 6,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['16.jpg', '17.jpg'],
                'variants' => [
                    ['size' => 'Medium', 'color' => 'Champagne Beige', 'sku' => 'WSU-GRG-007-BGE-M', 'stock' => 8, 'price_adjustment' => 0],
                    ['size' => 'Large', 'color' => 'Champagne Beige', 'sku' => 'WSU-GRG-007-BGE-L', 'stock' => 10, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Handcrafted Full-Grain Leather Tote Bag',
                'slug' => 'handcrafted-full-grain-leather-tote-bag',
                'sku' => 'WHB-TOT-008',
                'category_slug' => 'womens-handbags-clutches',
                'brand_slug' => 'leathercraft-guild',
                'short_description' => 'Top-grain cowhide leather structured tote with dual shoulder straps and laptop compartment.',
                'description' => 'Spacious everyday luxury bag with antique brass YKK hardware, internal microfiber divider, and protective metal studs at the bottom base.',
                'base_price' => 6400.00,
                'sale_price' => 5200.00,
                'cost_price' => 2900.00,
                'stock_quantity' => 22,
                'low_stock_threshold' => 5,
                'is_active' => true,
                'is_featured' => false,
                'is_new_arrival' => true,
                'images' => ['18.jpg', '21.jpg'],
                'variants' => [
                    ['size' => 'One Size', 'color' => 'Cognac Tan', 'sku' => 'WHB-TOT-008-TAN', 'stock' => 12, 'price_adjustment' => 0],
                    ['size' => 'One Size', 'color' => 'Midnight Black', 'sku' => 'WHB-TOT-008-BLK', 'stock' => 10, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Handcrafted Cap-Toe Leather Oxford Shoes',
                'slug' => 'handcrafted-cap-toe-leather-oxford-shoes',
                'sku' => 'MSH-OXF-009',
                'category_slug' => 'mens-formal-shoes',
                'brand_slug' => 'apex-heritage',
                'short_description' => 'Goodyear welted genuine calfskin leather dress shoes with hand-burnished toe polish.',
                'description' => 'The cornerstone of a formal wardrobe. Features full leather lining, cushioned orthotic insole, and stacked wooden heel with slip-resistant rubber tread insert.',
                'base_price' => 7800.00,
                'sale_price' => 6600.00,
                'cost_price' => 3800.00,
                'stock_quantity' => 30,
                'low_stock_threshold' => 8,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => false,
                'images' => ['23.jpg', '24.jpg'],
                'variants' => [
                    ['size' => '40 (EU)', 'color' => 'Hand-Burnished Brown', 'sku' => 'MSH-OXF-009-BRN-40', 'stock' => 6, 'price_adjustment' => 0],
                    ['size' => '41 (EU)', 'color' => 'Hand-Burnished Brown', 'sku' => 'MSH-OXF-009-BRN-41', 'stock' => 10, 'price_adjustment' => 0],
                    ['size' => '42 (EU)', 'color' => 'Hand-Burnished Brown', 'sku' => 'MSH-OXF-009-BRN-42', 'stock' => 8, 'price_adjustment' => 0],
                    ['size' => '43 (EU)', 'color' => 'Classic Black', 'sku' => 'MSH-OXF-009-BLK-43', 'stock' => 6, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'CloudStride Breathable Urban Sneakers',
                'slug' => 'cloudstride-breathable-urban-sneakers',
                'sku' => 'MSN-CLD-010',
                'category_slug' => 'casual-sneakers',
                'brand_slug' => 'apex-heritage',
                'short_description' => 'Lightweight knit upper sneakers with reactive EVA foam rebound cushion soles.',
                'description' => 'Engineered for street walking and all-day movement. Seamless knitted fly-mesh upper prevents heat buildup while anti-shock heel cups protect joints.',
                'base_price' => 3950.00,
                'sale_price' => 3150.00,
                'cost_price' => 1700.00,
                'stock_quantity' => 45,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['27.jpg', '28.jpg'],
                'variants' => [
                    ['size' => '41 (EU)', 'color' => 'Arctic White', 'sku' => 'MSN-CLD-010-WHT-41', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '42 (EU)', 'color' => 'Arctic White', 'sku' => 'MSN-CLD-010-WHT-42', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '43 (EU)', 'color' => 'Stealth Grey', 'sku' => 'MSN-CLD-010-GRY-43', 'stock' => 15, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Royal Heritage Automatic Chronograph Watch',
                'slug' => 'royal-heritage-automatic-chronograph-watch',
                'sku' => 'WTC-ROY-011',
                'category_slug' => 'luxury-timepieces',
                'brand_slug' => 'royal-chrono',
                'short_description' => '316L stainless steel self-winding mechanical watch with anti-reflective sapphire crystal glass.',
                'description' => 'Precision 24-jewel automatic movement with 42-hour power reserve. Water resistant up to 100 meters with transparent exhibition caseback and surgical steel link bracelet.',
                'base_price' => 18500.00,
                'sale_price' => 15900.00,
                'cost_price' => 8900.00,
                'stock_quantity' => 10,
                'low_stock_threshold' => 3,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['29.jpg', '30.jpg'],
                'variants' => [
                    ['size' => '42mm Dial', 'color' => 'Sunburst Blue / Silver Steel', 'sku' => 'WTC-ROY-011-BLU', 'stock' => 6, 'price_adjustment' => 0],
                    ['size' => '42mm Dial', 'color' => 'Onyx Black / Rose Gold', 'sku' => 'WTC-ROY-011-GLD', 'stock' => 4, 'price_adjustment' => 1000],
                ],
            ],
            [
                'name' => 'Minimalist RFID Top-Grain Leather Wallet',
                'slug' => 'minimalist-rfid-top-grain-leather-wallet',
                'sku' => 'WLT-MIN-012',
                'category_slug' => 'leather-wallets-belts',
                'brand_slug' => 'leathercraft-guild',
                'short_description' => 'Slim bi-fold wallet featuring RFID theft protection and 8 quick-access card slots.',
                'description' => 'Handcrafted from full-grain vegetable tanned leather that develops a rich vintage patina over years of use. Slim profile fits smoothly in front and back pockets.',
                'base_price' => 1650.00,
                'sale_price' => 1250.00,
                'cost_price' => 620.00,
                'stock_quantity' => 50,
                'low_stock_threshold' => 12,
                'is_active' => true,
                'is_featured' => false,
                'is_new_arrival' => false,
                'images' => ['31.jpg', '32.jpg'],
                'variants' => [
                    ['size' => 'Standard', 'color' => 'Espresso Brown', 'sku' => 'WLT-MIN-012-BRN', 'stock' => 25, 'price_adjustment' => 0],
                    ['size' => 'Standard', 'color' => 'Matte Black', 'sku' => 'WLT-MIN-012-BLK', 'stock' => 25, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Urban Oversized Heavyweight Cotton Tee',
                'slug' => 'urban-oversized-heavyweight-cotton-tee',
                'sku' => 'MTS-OVR-013',
                'category_slug' => 'mens-polo-t-shirts',
                'brand_slug' => 'ecstasy-streetwear',
                'short_description' => '240 GSM drop-shoulder boxy fit tee with high-density minimalist typographic print.',
                'description' => 'Pre-shrunk comb spun yarn tailored for streetwear enthusiasts. Ribbed mock collar and reinforced shoulder seam taping.',
                'base_price' => 1350.00,
                'sale_price' => 990.00,
                'cost_price' => 480.00,
                'stock_quantity' => 70,
                'low_stock_threshold' => 20,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => true,
                'images' => ['35.jpg', '36.jpg'],
                'variants' => [
                    ['size' => 'M', 'color' => 'Acid Wash Charcoal', 'sku' => 'MTS-OVR-013-CHR-M', 'stock' => 25, 'price_adjustment' => 0],
                    ['size' => 'L', 'color' => 'Acid Wash Charcoal', 'sku' => 'MTS-OVR-013-CHR-L', 'stock' => 25, 'price_adjustment' => 0],
                    ['size' => 'XL', 'color' => 'Off White', 'sku' => 'MTS-OVR-013-WHT-XL', 'stock' => 20, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Premium Reversible Leather Dress Belt',
                'slug' => 'premium-reversible-leather-dress-belt',
                'sku' => 'BLT-REV-014',
                'category_slug' => 'leather-wallets-belts',
                'brand_slug' => 'leathercraft-guild',
                'short_description' => 'Dual-sided black & brown full leather belt with twistable brushed nickel buckle.',
                'description' => 'Two versatile dress belts in one design. High-tensile bonded stitching and heat-sealed beveled edges for long-lasting business and semi-casual service.',
                'base_price' => 1850.00,
                'sale_price' => 1450.00,
                'cost_price' => 720.00,
                'stock_quantity' => 35,
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => false,
                'is_new_arrival' => false,
                'images' => ['39.jpg', '40.jpg'],
                'variants' => [
                    ['size' => '32-34', 'color' => 'Black / Brown Reversible', 'sku' => 'BLT-REV-014-32', 'stock' => 15, 'price_adjustment' => 0],
                    ['size' => '36-38', 'color' => 'Black / Brown Reversible', 'sku' => 'BLT-REV-014-36', 'stock' => 20, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Italian Linen Spread Collar Casual Shirt',
                'slug' => 'italian-linen-spread-collar-casual-shirt',
                'sku' => 'MSH-LIN-015',
                'category_slug' => 'mens-casual-shirts',
                'brand_slug' => 'sailor-elite',
                'short_description' => '100% Normandy flax linen shirt for supreme hot-weather breathability and natural texture.',
                'description' => 'Light, breezy, and effortlessly relaxed. Garment washed for velvety skin comfort with real coconut wood buttons and curved hemline.',
                'base_price' => 2950.00,
                'sale_price' => 2450.00,
                'cost_price' => 1350.00,
                'stock_quantity' => 4, // Deliberate low stock to test low-stock alerts!
                'low_stock_threshold' => 10,
                'is_active' => true,
                'is_featured' => true,
                'is_new_arrival' => false,
                'images' => ['1.jpg', '3.jpg'],
                'variants' => [
                    ['size' => 'M', 'color' => 'Sage Green', 'sku' => 'MSH-LIN-015-SGE-M', 'stock' => 2, 'price_adjustment' => 0],
                    ['size' => 'L', 'color' => 'Sage Green', 'sku' => 'MSH-LIN-015-SGE-L', 'stock' => 2, 'price_adjustment' => 0],
                ],
            ],
            [
                'name' => 'Tailored Stretch Chino Pants',
                'slug' => 'tailored-stretch-chino-pants',
                'sku' => 'MTR-CHN-016',
                'category_slug' => 'mens-denim-trousers',
                'brand_slug' => 'sailor-elite',
                'short_description' => 'Mid-rise straight tapered chinos in 98% cotton twill and 2% elastane flex.',
                'description' => 'The ultimate versatile smart-casual trouser. Features coin pocket detailing, chambray inner waistband lining, and reinforced bar-tacked stress points.',
                'base_price' => 2750.00,
                'sale_price' => 2200.00,
                'cost_price' => 1100.00,
                'stock_quantity' => 3, // Low stock item
                'low_stock_threshold' => 8,
                'is_active' => true,
                'is_featured' => false,
                'is_new_arrival' => true,
                'images' => ['5.jpg', '6.jpg'],
                'variants' => [
                    ['size' => '32', 'color' => 'Khaki Tan', 'sku' => 'MTR-CHN-016-KHK-32', 'stock' => 2, 'price_adjustment' => 0],
                    ['size' => '34', 'color' => 'Khaki Tan', 'sku' => 'MTR-CHN-016-KHK-34', 'stock' => 1, 'price_adjustment' => 0],
                ],
            ],
        ];

        foreach ($productsData as $pData) {
            $cat = $categories->get($pData['category_slug']) ?? $categories->first();
            $brand = $brands->get($pData['brand_slug']) ?? $brands->first();

            $product = Product::updateOrCreate(
                ['slug' => $pData['slug']],
                [
                    'category_id' => $cat?->id,
                    'brand_id' => $brand?->id,
                    'name' => $pData['name'],
                    'slug' => $pData['slug'],
                    'sku' => $pData['sku'],
                    'short_description' => $pData['short_description'],
                    'description' => $pData['description'],
                    'base_price' => $pData['base_price'],
                    'sale_price' => $pData['sale_price'],
                    'cost_price' => $pData['cost_price'],
                    'stock_quantity' => $pData['stock_quantity'],
                    'low_stock_threshold' => $pData['low_stock_threshold'],
                    'is_active' => $pData['is_active'],
                    'is_featured' => $pData['is_featured'],
                    'is_new_arrival' => $pData['is_new_arrival'],
                    'meta_title' => $pData['name'] . ' - ORIO Style',
                    'meta_description' => $pData['short_description'],
                ]
            );

            // Seed Product Images
            $images = $pData['images'] ?? ['1.jpg'];
            foreach ($images as $idx => $imgFile) {
                $imgPath = 'products/' . $imgFile;
                ProductImage::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'image_path' => $imgPath,
                    ],
                    [
                        'product_id' => $product->id,
                        'image_path' => $imgPath,
                        'is_primary' => ($idx === 0),
                        'display_order' => $idx + 1,
                    ]
                );
            }

            // Seed Product Variants
            $variants = $pData['variants'] ?? [];
            foreach ($variants as $vData) {
                ProductVariant::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'sku' => $vData['sku'],
                    ],
                    [
                        'product_id' => $product->id,
                        'sku' => $vData['sku'],
                        'size' => $vData['size'],
                        'color' => $vData['color'],
                        'price_adjustment' => $vData['price_adjustment'] ?? 0,
                        'stock_quantity' => $vData['stock'],
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
