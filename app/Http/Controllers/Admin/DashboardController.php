<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
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

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'todayRevenue' => 0.00,
                'totalOrders' => 0,
                'pendingOrders' => 0,
                'lowStockItems' => $lowStockCount,
                'totalProducts' => $totalProductsCount,
                'totalBrands' => $totalBrandsCount,
            ],
            'user' => $request->user()->only('id', 'name', 'email', 'role'),
        ]);
    }
}
