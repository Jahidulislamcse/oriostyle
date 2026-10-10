<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\HomepageBentoSlot;
use App\Services\Storefront\HomepageBentoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomepageBentoController extends Controller
{
    public function __construct(
        protected HomepageBentoService $bentoService
    ) {}

    /**
     * Display the visual Homepage Bento Mosaic Builder.
     */
    public function index(): Response
    {
        $slots = $this->bentoService->getAllSlots();
        $categories = Category::query()
            ->active()
            ->orderBy('name')
            ->select('id', 'name', 'slug')
            ->get();

        return Inertia::render('Admin/Banners/BentoManager', [
            'slots' => $slots,
            'categories' => $categories,
        ]);
    }

    /**
     * Update a specific Bento slot configuration and/or image.
     */
    public function update(Request $request, HomepageBentoSlot $slot): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'title' => 'nullable|string|max:100',
            'subtitle' => 'nullable|string|max:150',
            'has_arrow' => 'nullable|boolean',
            'dark_badge' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'remove_image' => 'nullable|boolean',
        ]);

        $this->bentoService->updateSlot(
            $slot,
            $validated,
            $request->file('image'),
            $request->boolean('remove_image')
        );

        return redirect()->back()->with('success', "Slot '{$slot->display_title}' updated successfully.");
    }

    /**
     * Toggle slot active status.
     */
    public function toggleActive(HomepageBentoSlot $slot): RedirectResponse
    {
        $this->bentoService->toggleActive($slot);

        return redirect()->back()->with('success', "Slot '{$slot->display_title}' visibility updated.");
    }
}
