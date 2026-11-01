<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected AdminNotificationService $notificationService
    ) {}

    /**
     * Return ultra-lightweight JSON payload for background polling.
     */
    public function poll(Request $request): JsonResponse
    {
        $alerts = $this->notificationService->getHeaderAlerts();

        return response()->json($alerts, 200, [
            'Cache-Control' => 'no-cache, private',
        ]);
    }
}
