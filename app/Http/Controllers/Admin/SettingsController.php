<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Services\Settings\SettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings management panel.
     */
    public function index(SettingService $settingService): Response
    {
        $settings = $settingService->getAllPublicCached();

        $system = [
            'phpVersion' => PHP_VERSION,
            'laravelVersion' => app()->version(),
            'cacheDriver' => config('cache.default'),
            'storageLinked' => File::exists(public_path('storage')),
            'serverTime' => now()->format('Y-m-d H:i:s T'),
            'timezone' => config('app.timezone'),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'system' => $system,
        ]);
    }

    /**
     * Update the platform settings.
     */
    public function update(UpdateSettingsRequest $request, SettingService $settingService): RedirectResponse
    {
        $validated = $request->validated();

        // 1. Handle Brand Logo Upload & Removal
        if ($request->hasFile('site_logo')) {
            $settingService->uploadSettingFile($request->file('site_logo'), 'site_logo', 'general');
        } elseif ($request->boolean('remove_site_logo')) {
            $settingService->deleteSettingFile('site_logo');
        }

        // 2. Handle White/Light Logo Upload & Removal
        if ($request->hasFile('site_logo_white')) {
            $settingService->uploadSettingFile($request->file('site_logo_white'), 'site_logo_white', 'general');
        } elseif ($request->boolean('remove_site_logo_white')) {
            $settingService->deleteSettingFile('site_logo_white');
        }

        // 3. Handle Favicon Upload & Removal
        if ($request->hasFile('site_favicon')) {
            $settingService->uploadSettingFile($request->file('site_favicon'), 'site_favicon', 'general');
        } elseif ($request->boolean('remove_site_favicon')) {
            $settingService->deleteSettingFile('site_favicon');
        }

        // Exclude file inputs and removal booleans from direct batch assignment
        $cleanSettings = collect($validated)->except([
            'site_logo',
            'site_logo_white',
            'site_favicon',
            'remove_site_logo',
            'remove_site_logo_white',
            'remove_site_favicon',
        ])->toArray();

        // 4. Batch update remaining text/number/boolean settings
        $settingService->setMany($cleanSettings);

        return redirect()->back()->with('success', 'Dynamic platform settings updated and cache synchronized successfully!');
    }

    /**
     * Purge and refresh the public settings cache.
     */
    public function clearCache(SettingService $settingService): RedirectResponse
    {
        $settingService->clearCache();

        return redirect()->back()->with('success', 'Public settings cache successfully purged and refreshed!');
    }
}
