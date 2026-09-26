<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin Central Dashboard.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'todayRevenue' => 0.00,
                'totalOrders' => 0,
                'pendingOrders' => 0,
                'lowStockItems' => 0,
            ],
            'user' => $request->user()->only('id', 'name', 'email', 'role'),
        ]);
    }
}
