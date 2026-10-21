<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Order;
use App\Models\Product;
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
        $lowStockCount = Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count();
        $totalProductsCount = Product::count();
        $totalBrandsCount = Brand::count();

        $totalOrdersCount = Order::count();
        $pendingOrdersCount = Order::pending()->count();
        $todayRevenue = (float) Order::whereDate('created_at', today())
            ->where(function ($q) {
                $q->where('payment_status', Order::PAYMENT_PAID)
                  ->orWhere('order_status', Order::STATUS_DELIVERED);
            })->sum('total_amount');

        $recentOrders = Order::query()
            ->withCount('items')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'todayRevenue' => $todayRevenue,
                'totalOrders' => $totalOrdersCount,
                'pendingOrders' => $pendingOrdersCount,
                'lowStockItems' => $lowStockCount,
                'totalProducts' => $totalProductsCount,
                'totalBrands' => $totalBrandsCount,
            ],
            'recentOrders' => $recentOrders,
            'user' => $request->user()->only('id', 'name', 'email', 'role'),
        ]);
    }
}
