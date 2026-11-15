<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AdminAuthController extends Controller
{
    /**
     * Display the administrative login view.
     */
    public function showLoginForm(): Response|SymfonyResponse
    {
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming administrative authentication request.
     */
    public function login(AdminLoginRequest $request): SymfonyResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $intendedUrl = redirect()->intended(route('admin.dashboard'))->getTargetUrl();

        return Inertia::location($intendedUrl);
    }

    /**
     * Destroy an authenticated administrative session.
     */
    public function logout(Request $request): SymfonyResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('admin.login'));
    }
}
