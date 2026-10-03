<?php

namespace App\Services\Catalog;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandService
{
    public const CACHE_BRANDS_KEY = 'storefront:brands';
    public const CACHE_TTL_SECONDS = 86400; // 24 Hours

    /**
     * Get brands list for admin management.
     */
    public function getAdminBrandsList(?string $search = null, ?string $status = null)
    {
        $query = Brand::query()
            ->withCount('products')
            ->orderBy('display_order')
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        return $query->get();
    }

    /**
     * Create brand with optional logo file.
     */
    public function createBrand(array $data, ?UploadedFile $logoFile = null): Brand
    {
        if (!empty($data['website_url']) && !str_starts_with($data['website_url'], 'http://') && !str_starts_with($data['website_url'], 'https://')) {
            $data['website_url'] = 'https://' . $data['website_url'];
        }

        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        if ($logoFile) {
            $data['logo'] = $this->uploadLogo($logoFile);
        }

        $brandData = array_diff_key($data, array_flip(['remove_logo']));
        $brand = Brand::create($brandData);
        $this->flushCache();

        return $brand;
    }

    /**
     * Update brand.
     */
    public function updateBrand(Brand $brand, array $data, ?UploadedFile $logoFile = null, bool $removeLogo = false): Brand
    {
        if (!empty($data['website_url']) && !str_starts_with($data['website_url'], 'http://') && !str_starts_with($data['website_url'], 'https://')) {
            $data['website_url'] = 'https://' . $data['website_url'];
        }
        if (!empty($data['name']) && $data['name'] !== $brand->name && empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $brand->id);
        }

        $removeLogo = $removeLogo || !empty($data['remove_logo']);
        if ($removeLogo && $brand->logo) {
            $this->deleteLogo($brand->logo);
            $data['logo'] = null;
        }

        if ($logoFile) {
            if ($brand->logo) {
                $this->deleteLogo($brand->logo);
            }
            $data['logo'] = $this->uploadLogo($logoFile);
        }

        $brandData = array_diff_key($data, array_flip(['remove_logo']));
        $brand->update($brandData);
        $this->flushCache();

        return $brand;
    }

    /**
     * Delete brand.
     */
    public function deleteBrand(Brand $brand): bool
    {
        if ($brand->logo) {
            $this->deleteLogo($brand->logo);
        }

        $result = $brand->delete();
        $this->flushCache();

        return (bool) $result;
    }

    /**
     * Upload logo image.
     */
    protected function uploadLogo(UploadedFile $file): string
    {
        $path = $file->store('brands', 'public');
        return Storage::disk('public')->url($path);
    }

    /**
     * Delete logo file.
     */
    protected function deleteLogo(string $logoUrl): void
    {
        $relativePath = Str::after($logoUrl, '/storage/');
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
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

        while (Brand::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }

    /**
     * Flush cache.
     */
    public function flushCache(): void
    {
        Cache::forget(self::CACHE_BRANDS_KEY);
    }
}
