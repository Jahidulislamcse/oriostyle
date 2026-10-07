<?php

namespace App\Services\Catalog;

use App\Models\Banner;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class BannerService
{
    public const CACHE_KEY = 'storefront_banners_all';
    public const CACHE_TTL = 3600; // 1 hour

    /**
     * Get paginated banners list for Admin Panel.
     */
    public function getAdminBannersList(?string $type = null, ?string $search = null, ?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Banner::query();

        if (!empty($type) && $type !== 'all') {
            $query->where('type', $type);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('badge_text', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        return $query->orderBy('type')
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Get active banners grouped by type for Storefront (cached).
     */
    public function getActiveStorefrontBanners(): Collection
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Banner::query()
                ->active()
                ->ordered()
                ->get()
                ->groupBy('type');
        });
    }

    /**
     * Create a new banner with optional image upload.
     */
    public function createBanner(array $data, ?UploadedFile $imageFile = null): Banner
    {
        if ($imageFile && $imageFile->isValid()) {
            $path = $imageFile->store('banners', 'public');
            $data['image_path'] = $path;
        }

        unset($data['image'], $data['remove_image']);

        $banner = Banner::create($data);
        $this->flushCache();

        return $banner;
    }

    /**
     * Update an existing banner with optional image replacement.
     */
    public function updateBanner(Banner $banner, array $data, ?UploadedFile $imageFile = null, bool $removeImage = false): Banner
    {
        if ($removeImage) {
            $this->deleteStoredImage($banner->image_path);
            $data['image_path'] = null;
        }

        if ($imageFile && $imageFile->isValid()) {
            $this->deleteStoredImage($banner->image_path);
            $path = $imageFile->store('banners', 'public');
            $data['image_path'] = $path;
        }

        unset($data['image'], $data['remove_image']);

        $banner->update($data);
        $this->flushCache();

        return $banner;
    }

    /**
     * Delete banner and its associated uploaded file.
     */
    public function deleteBanner(Banner $banner): bool
    {
        $this->deleteStoredImage($banner->image_path);
        $deleted = $banner->delete();
        $this->flushCache();

        return (bool) $deleted;
    }

    /**
     * Flush banner cache.
     */
    public function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Safely delete image file from public disk if stored locally.
     */
    protected function deleteStoredImage(?string $path): void
    {
        if (empty($path)) {
            return;
        }

        if (str_starts_with($path, 'http') || str_starts_with($path, '/storefront/')) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
