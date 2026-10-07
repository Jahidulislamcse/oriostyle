<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\Catalog\BannerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function __construct(
        protected BannerService $bannerService
    ) {}

    /**
     * Display banners list with filters and stats.
     */
    public function index(Request $request): Response
    {
        $type = $request->query('type', 'all');
        $search = $request->query('search');
        $status = $request->query('status', 'all');

        $banners = $this->bannerService->getAdminBannersList($type, $search, $status);

        $stats = [
            'total' => Banner::count(),
            'hero_count' => Banner::where('type', 'hero')->count(),
            'split_count' => Banner::where('type', 'split')->count(),
            'promo_count' => Banner::where('type', 'promo')->count(),
            'active_count' => Banner::where('is_active', true)->count(),
        ];

        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
            'stats' => $stats,
            'filters' => [
                'type' => $type,
                'search' => $search ?? '',
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store new banner.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge_text' => 'nullable|string|max:100',
            'button_text' => 'nullable|string|max:100',
            'link_url' => 'nullable|string|max:255',
            'type' => 'required|string|in:hero,split,promo',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg,gif|max:5120',
            'image_path' => 'nullable|string|max:255',
        ]);

        $imageFile = $request->file('image');
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['display_order'] = $validated['display_order'] ?? 0;

        $this->bannerService->createBanner($validated, $imageFile);

        return redirect()->back()->with('success', 'Banner created successfully.');
    }

    /**
     * Update existing banner.
     */
    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge_text' => 'nullable|string|max:100',
            'button_text' => 'nullable|string|max:100',
            'link_url' => 'nullable|string|max:255',
            'type' => 'required|string|in:hero,split,promo',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg,gif|max:5120',
            'image_path' => 'nullable|string|max:255',
            'remove_image' => 'nullable|boolean',
        ]);

        $imageFile = $request->file('image');
        $removeImage = $request->boolean('remove_image');
        $validated['is_active'] = $request->boolean('is_active');
        $validated['display_order'] = $validated['display_order'] ?? 0;

        $this->bannerService->updateBanner($banner, $validated, $imageFile, $removeImage);

        return redirect()->back()->with('success', 'Banner updated successfully.');
    }

    /**
     * Toggle banner active status.
     */
    public function toggleActive(Banner $banner): RedirectResponse
    {
        $banner->update(['is_active' => !$banner->is_active]);
        $this->bannerService->flushCache();

        $statusText = $banner->is_active ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Banner #{$banner->id} ({$banner->title}) {$statusText}.");
    }

    /**
     * Delete banner.
     */
    public function destroy(Request $request, Banner|string|null $banner = null): RedirectResponse
    {
        if (!($banner instanceof Banner)) {
            $bannerId = $request->input('id') ?? ($banner !== 'destroy' ? $banner : null) ?? $request->route('banner');
            $banner = $bannerId ? Banner::find($bannerId) : null;
        }

        if (!$banner) {
            return redirect()->back()->with('error', 'Banner not found or already deleted.');
        }

        $title = $banner->title ?: "#{$banner->id}";
        $this->bannerService->deleteBanner($banner);

        return redirect()->back()->with('success', "Banner '{$title}' deleted successfully.");
    }
}
