<?php

namespace App\Services\Storefront;

use App\Models\HomepageBentoSlot;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class HomepageBentoService
{
    public const CACHE_KEY = 'storefront_bento_slots_active';
    public const CACHE_TTL = 3600; // 1 hour

    /**
     * Get all bento slots for Admin visual manager.
     */
    public function getAllSlots(): Collection
    {
        return HomepageBentoSlot::query()
            ->with(['category:id,name,slug'])
            ->orderBy('display_order', 'asc')
            ->get();
    }

    /**
     * Get active bento slots for Storefront homepage (cached).
     */
    public function getActiveSlotsForStorefront(): Collection
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return HomepageBentoSlot::query()
                ->active()
                ->with(['category:id,name,slug'])
                ->get()
                ->keyBy('slot_key');
        });
    }

    /**
     * Update a bento slot configuration and optional image.
     */
    public function updateSlot(
        HomepageBentoSlot $slot,
        array $data,
        ?UploadedFile $imageFile = null,
        bool $removeImage = false
    ): HomepageBentoSlot {
        if ($removeImage) {
            $this->deleteStoredImage($slot->image_path);
            $data['image_path'] = null;
        }

        if ($imageFile && $imageFile->isValid()) {
            $this->deleteStoredImage($slot->image_path);
            $path = $imageFile->store('bento', 'public');
            $data['image_path'] = $path;
        }

        unset($data['image'], $data['remove_image']);

        $slot->update($data);
        $this->flushCache();

        return $slot->fresh(['category:id,name,slug']);
    }

    /**
     * Toggle slot active status.
     */
    public function toggleActive(HomepageBentoSlot $slot): bool
    {
        $slot->is_active = !$slot->is_active;
        $saved = $slot->save();
        $this->flushCache();

        return $saved;
    }

    /**
     * Safely delete an uploaded image from public disk.
     */
    protected function deleteStoredImage(?string $path): void
    {
        if (empty($path)) {
            return;
        }

        // Avoid deleting static preset demo images
        if (str_starts_with($path, '/storefront/') || str_starts_with($path, 'storefront/')) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Invalidate storefront bento cache.
     */
    public function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
