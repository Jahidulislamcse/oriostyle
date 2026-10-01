<?php

namespace App\Services\Catalog;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    public const CACHE_FEATURED_PRODUCTS_KEY = 'storefront:featured_products';
    public const CACHE_TTL_SECONDS = 86400; // 24 Hours

    /**
     * Get paginated products list for backoffice admin with eager loaded relations.
     */
    public function getAdminProductsList(
        ?string $search = null,
        ?string $category = null,
        ?string $brand = null,
        ?string $status = null,
        int $perPage = 15
    ): LengthAwarePaginator {
        $query = Product::query()
            ->with([
                'category:id,name,slug',
                'brand:id,name,slug',
                'primaryImage',
                'images',
            ])
            ->withCount(['variants', 'images'])
            ->orderBy('id', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (is_numeric($category)) {
            $query->where('category_id', (int) $category);
        }

        if (is_numeric($brand)) {
            $query->where('brand_id', (int) $brand);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        } elseif ($status === 'low_stock') {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        } elseif ($status === 'out_of_stock') {
            $query->where('stock_quantity', '<=', 0);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Create product with images and variants.
     */
    public function createProduct(array $data, array $images = [], array $variants = []): Product
    {
        return DB::transaction(function () use ($data, $images, $variants) {
            if (empty($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['name']);
            }

            if (empty($data['sku'])) {
                $data['sku'] = $this->generateUniqueSku($data['name']);
            }

            $productData = array_diff_key($data, array_flip(['images', 'variants']));
            $product = Product::create($productData);

            // Handle primary & gallery images
            if (!empty($images)) {
                $this->syncProductImages($product, $images);
            }

            // Handle variants
            if (!empty($variants)) {
                $this->syncProductVariants($product, $variants);
            }

            $this->flushCache();
            return $product;
        });
    }

    /**
     * Update product details, images, and variants.
     */
    public function updateProduct(Product $product, array $data, array $images = [], array $variants = []): Product
    {
        return DB::transaction(function () use ($product, $data, $images, $variants) {
            if (!empty($data['name']) && $data['name'] !== $product->name && empty($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['name'], $product->id);
            }

            $productData = array_diff_key($data, array_flip(['images', 'variants']));
            $product->update($productData);

            if (!empty($images)) {
                $this->syncProductImages($product, $images);
            }

            if (!empty($variants)) {
                $this->syncProductVariants($product, $variants);
            }

            $this->flushCache();
            return $product;
        });
    }

    /**
     * Quick stock adjustment.
     */
    public function updateStock(Product $product, int $newStock): Product
    {
        $product->update(['stock_quantity' => max(0, $newStock)]);
        $this->flushCache();
        return $product;
    }

    /**
     * Delete product & files.
     */
    public function deleteProduct(Product $product): bool
    {
        return DB::transaction(function () use ($product) {
            foreach ($product->images as $img) {
                $relativePath = Str::after($img->image_path, '/storage/');
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }

            $result = $product->delete();
            $this->flushCache();
            return (bool) $result;
        });
    }

    /**
     * Sync Product Images
     */
    protected function syncProductImages(Product $product, array $images): void
    {
        foreach ($images as $index => $imgItem) {
            if ($imgItem instanceof UploadedFile) {
                $path = $imgItem->store('products', 'public');
                $url = Storage::disk('public')->url($path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $url,
                    'is_primary' => $index === 0 && !$product->primaryImage()->exists(),
                    'display_order' => $index,
                ]);
            }
        }
    }

    /**
     * Sync Product Variants
     */
    protected function syncProductVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();

        foreach ($variants as $var) {
            if (!empty($var['size']) || !empty($var['color'])) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $var['sku'] ?? ($product->sku . '-' . Str::upper(Str::slug(($var['color'] ?? '') . '-' . ($var['size'] ?? '')))),
                    'size' => $var['size'] ?? null,
                    'color' => $var['color'] ?? null,
                    'price_adjustment' => $var['price_adjustment'] ?? 0.00,
                    'stock_quantity' => $var['stock_quantity'] ?? 0,
                    'is_active' => $var['is_active'] ?? true,
                ]);
            }
        }
    }

    /**
     * Unique slug generator.
     */
    public function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (Product::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    /**
     * Unique SKU generator.
     */
    public function generateUniqueSku(string $name): string
    {
        $prefix = Str::upper(Str::substr(Str::slug($name, ''), 0, 4)) ?: 'PROD';
        $random = Str::upper(Str::random(5));
        $sku = "{$prefix}-{$random}";

        while (Product::where('sku', $sku)->exists()) {
            $random = Str::upper(Str::random(5));
            $sku = "{$prefix}-{$random}";
        }

        return $sku;
    }

    /**
     * Flush cache.
     */
    public function flushCache(): void
    {
        Cache::forget(self::CACHE_FEATURED_PRODUCTS_KEY);
    }
}
