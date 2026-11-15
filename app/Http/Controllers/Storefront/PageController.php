<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        protected SettingService $settingService
    ) {}

    /**
     * Display About ORIO STYLE Page.
     */
    public function about(Request $request): Response
    {
        $settings = $this->settingService->getAllPublicCached();

        return Inertia::render('Storefront/Pages/About', [
            'settings' => $settings,
        ]);
    }

    /**
     * Display Store Locator & Experience Studios Page.
     */
    public function storeLocator(Request $request): Response
    {
        $settings = $this->settingService->getAllPublicCached();

        // Safely parse store locations JSON if available
        $locations = [];
        if (!empty($settings['store_locations'])) {
            $locations = is_string($settings['store_locations'])
                ? json_decode($settings['store_locations'], true) ?? []
                : $settings['store_locations'];
        }

        return Inertia::render('Storefront/Pages/StoreLocator', [
            'settings' => $settings,
            'locations' => $locations,
        ]);
    }

    /**
     * Display Blogs & Editorial Journal Page.
     */
    public function blogs(Request $request): Response
    {
        $settings = $this->settingService->getAllPublicCached();

        // Safely parse blog posts JSON
        $posts = [];
        if (!empty($settings['blog_posts'])) {
            $posts = is_string($settings['blog_posts'])
                ? json_decode($settings['blog_posts'], true) ?? []
                : $settings['blog_posts'];
        }

        return Inertia::render('Storefront/Pages/Blogs', [
            'settings' => $settings,
            'posts' => $posts,
        ]);
    }

    /**
     * Display Terms of Service Legal Document.
     */
    public function terms(Request $request): Response
    {
        $settings = $this->settingService->getAllPublicCached();

        return Inertia::render('Storefront/Pages/Terms', [
            'settings' => $settings,
        ]);
    }

    /**
     * Display Privacy Policy Legal Document.
     */
    public function privacy(Request $request): Response
    {
        $settings = $this->settingService->getAllPublicCached();

        return Inertia::render('Storefront/Pages/Privacy', [
            'settings' => $settings,
        ]);
    }

    /**
     * Display Refund, Return & Exchange Policy Page.
     */
    public function refund(Request $request): Response
    {
        $settings = $this->settingService->getAllPublicCached();

        return Inertia::render('Storefront/Pages/Refund', [
            'settings' => $settings,
        ]);
    }
}
