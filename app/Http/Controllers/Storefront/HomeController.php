<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\Storefront\StorefrontService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected StorefrontService $storefrontService
    ) {}

    /**
     * Display storefront homepage.
     */
    public function index(): Response
    {
        $data = $this->storefrontService->getHomepageData();

        return Inertia::render('Welcome', [
            'laravelVersion' => app()->version(),
            'phpVersion' => PHP_VERSION,
            'dbStatus' => 'connected',
            'antiN1Status' => Model::preventsLazyLoading() ? 'enforced' : 'inactive',
            'categoriesTree' => $data['categoriesTree'],
            'featuredBrands' => $data['featuredBrands'],
            'featuredProducts' => $data['featuredProducts'],
            'newArrivals' => $data['newArrivals'],
        ]);
    }
}
