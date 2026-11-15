<?php

use App\Http\Middleware\EnsureAdminAccess;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->redirectGuestsTo(fn (\Illuminate\Http\Request $request) => 
            $request->is('admin*') ? route('admin.login') : route('login')
        );

        $middleware->redirectUsersTo(fn (\Illuminate\Http\Request $request) => 
            \Illuminate\Support\Facades\Auth::guard('admin')->check() || $request->is('admin*') 
                ? route('admin.dashboard') 
                : route('home')
        );

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => EnsureAdminAccess::class,
            'role' => EnsureRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
