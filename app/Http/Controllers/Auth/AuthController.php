<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\Storefront\CartService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthController extends Controller
{
    /**
     * Display the login view.
     */
    public function showLoginForm(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login(LoginRequest $request): SymfonyResponse
    {
        $request->authenticate();

        $guestSessionId = $request->header('X-Cart-Session')
            ?: ($request->cookie('cart_session') ?: $request->session()->getId());

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();

        // Merge any guest cart items into customer account cart
        if ($guestSessionId && $user) {
            app(CartService::class)->mergeGuestCartIntoUser($guestSessionId, $user);
        }

        // Redirect admin/staff to admin dashboard, customers to intended or home
        if ($user->hasAdminAccess()) {
            return Inertia::location(route('admin.dashboard'));
        }

        return redirect()->intended(route('home'));
    }

    /**
     * Display the registration view.
     */
    public function showRegisterForm(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function register(RegisterRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        $guestSessionId = $request->header('X-Cart-Session')
            ?: ($request->cookie('cart_session') ?: $request->session()->getId());

        Auth::login($user);

        if ($guestSessionId) {
            app(CartService::class)->mergeGuestCartIntoUser($guestSessionId, $user);
        }

        return redirect(route('home'))->with('success', 'Welcome! Your account has been created successfully.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('info', 'You have been logged out.');
    }
}
