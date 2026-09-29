<?php

namespace App\Http\Middleware;

use App\Services\Settings\SettingService;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        /** @var SettingService $settingService */
        $settingService = app(SettingService::class);
        $settings = $settingService->getAllPublicCached();

        return [
            ...parent::share($request),
            'appName' => $settings['site_name'] ?? config('app.name', 'ORIO STYLE'),
            'settings' => $settings,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone ?? null,
                    'role' => $request->user()->role ?? 'customer',
                    'is_active' => (bool) ($request->user()->is_active ?? true),
                ] : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
                'url' => $request->getSchemeAndHttpHost(),
                'port' => ($request->getPort() !== 80 && $request->getPort() !== 443) ? $request->getPort() : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
