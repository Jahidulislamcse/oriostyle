<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\StorageFileController;

/*
|--------------------------------------------------------------------------
| Storage Static File Fallback Delivery (Guarantees 200 OK across Shared Hosting & Symlinks)
|--------------------------------------------------------------------------
*/
Route::get('/storage/{path}', [StorageFileController::class, 'show'])
    ->where('path', '.*')
    ->name('storage.local');

/*
|--------------------------------------------------------------------------
| Storefront Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Authentication Routes (Guest Only)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

/*
|--------------------------------------------------------------------------
| Admin & Backoffice Protected Routes (Requires Auth & Staff Role)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'admin'])
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Phase 4: Category Hierarchy & Taxonomy
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/index', fn () => redirect()->route('admin.categories.index'));
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::post('/categories/store', [CategoryController::class, 'store']);
        Route::delete('/categories/destroy', [CategoryController::class, 'destroy']);
        Route::match(['post', 'put'], '/categories/update', fn () => redirect()->route('admin.categories.index'));
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::patch('/categories/{category}/toggle-active', [CategoryController::class, 'toggleActive'])->name('categories.toggle-active');
        Route::patch('/categories/{category}/toggle-featured', [CategoryController::class, 'toggleFeatured'])->name('categories.toggle-featured');

        // Phase 6: Brand Catalog Management
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/index', fn () => redirect()->route('admin.brands.index'));
        Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
        Route::post('/brands/store', [BrandController::class, 'store']);
        Route::delete('/brands/destroy', [BrandController::class, 'destroy']);
        Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');
        Route::patch('/brands/{brand}/toggle-active', [BrandController::class, 'toggleActive'])->name('brands.toggle-active');
        Route::patch('/brands/{brand}/toggle-featured', [BrandController::class, 'toggleFeatured'])->name('brands.toggle-featured');
        Route::patch('/brands/toggle-active', fn () => redirect()->route('admin.brands.index'));
        Route::patch('/brands/toggle-featured', fn () => redirect()->route('admin.brands.index'));
        Route::match(['post', 'put'], '/brands/update', fn () => redirect()->route('admin.brands.index'));

        // Phase 6: Product & Inventory Management
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/index', fn () => redirect()->route('admin.products.index'));
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::post('/products/store', [ProductController::class, 'store']);
        Route::delete('/products/destroy', [ProductController::class, 'destroy']);
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::get('/products/edit/{product}', [ProductController::class, 'edit']);
        Route::get('/products/edit', fn () => redirect()->route('admin.products.index'));
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::patch('/products/{product}/toggle-active', [ProductController::class, 'toggleActive'])->name('products.toggle-active');
        Route::patch('/products/{product}/toggle-featured', [ProductController::class, 'toggleFeatured'])->name('products.toggle-featured');
        Route::patch('/products/{product}/update-stock', [ProductController::class, 'updateStock'])->name('products.update-stock');
        Route::patch('/products/toggle-active', fn () => redirect()->route('admin.products.index'));
        Route::patch('/products/toggle-featured', fn () => redirect()->route('admin.products.index'));
        Route::patch('/products/update-stock', fn () => redirect()->route('admin.products.index'));
        Route::match(['post', 'put'], '/products/update', fn () => redirect()->route('admin.products.index'));

        // Dynamic Banners & Sliders CMS
        Route::get('/banners', [BannerController::class, 'index'])->name('banners.index');
        Route::get('/banners/index', fn () => redirect()->route('admin.banners.index'));
        Route::post('/banners', [BannerController::class, 'store'])->name('banners.store');
        Route::post('/banners/store', [BannerController::class, 'store']);
        Route::delete('/banners/destroy', [BannerController::class, 'destroy']);
        Route::put('/banners/{banner}', [BannerController::class, 'update'])->name('banners.update');
        Route::delete('/banners/{banner}', [BannerController::class, 'destroy'])->name('banners.destroy');
        Route::patch('/banners/{banner}/toggle-active', [BannerController::class, 'toggleActive'])->name('banners.toggle-active');

        // Dynamic System Settings & CMS Identity
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.clear-cache');
    });
