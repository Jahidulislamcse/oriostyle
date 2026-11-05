<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $patterns = [
            'http://localhost:8000/storage/',
            'https://localhost:8000/storage/',
            'http://localhost/storage/',
            'https://localhost/storage/',
            'http://127.0.0.1:8000/storage/',
            'https://127.0.0.1:8000/storage/',
            'http://127.0.0.1/storage/',
            'https://127.0.0.1/storage/',
            'http://localhost:8000/',
            'https://localhost:8000/',
            'http://127.0.0.1:8000/',
            'https://127.0.0.1:8000/',
        ];

        // 1. brands.logo
        if (Schema::hasColumn('brands', 'logo')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE brands SET logo = REPLACE(logo, ?, '') WHERE logo LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 2. category_images.image_path
        if (Schema::hasColumn('category_images', 'image_path')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE category_images SET image_path = REPLACE(image_path, ?, '') WHERE image_path LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 3. product_images.image_path
        if (Schema::hasColumn('product_images', 'image_path')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE product_images SET image_path = REPLACE(image_path, ?, '') WHERE image_path LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 4. categories.image & banner
        if (Schema::hasColumn('categories', 'image')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE categories SET image = REPLACE(image, ?, '') WHERE image LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }
        if (Schema::hasColumn('categories', 'banner')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE categories SET banner = REPLACE(banner, ?, '') WHERE banner LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 5. banners.image_path & mobile_image_path
        if (Schema::hasColumn('banners', 'image_path')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE banners SET image_path = REPLACE(image_path, ?, '') WHERE image_path LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }
        if (Schema::hasColumn('banners', 'mobile_image_path')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE banners SET mobile_image_path = REPLACE(mobile_image_path, ?, '') WHERE mobile_image_path LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 6. order_items.image_path
        if (Schema::hasColumn('order_items', 'image_path')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE order_items SET image_path = REPLACE(image_path, ?, '') WHERE image_path LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 7. settings.value
        if (Schema::hasColumn('settings', 'value')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE settings SET value = REPLACE(value, ?, '') WHERE value LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 8. homepage_bento_slots.image_path
        if (Schema::hasColumn('homepage_bento_slots', 'image_path')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE homepage_bento_slots SET image_path = REPLACE(image_path, ?, '') WHERE image_path LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }

        // 9. users.avatar
        if (Schema::hasColumn('users', 'avatar')) {
            foreach ($patterns as $pattern) {
                DB::statement("UPDATE users SET avatar = REPLACE(avatar, ?, '') WHERE avatar LIKE ?", [$pattern, "%{$pattern}%"]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed
    }
};
