<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\Storefront\CartService;
use App\Services\Storefront\WishlistService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
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

        // Merge any guest cart & wishlist items into customer account
        if ($guestSessionId && $user) {
            app(CartService::class)->mergeGuestCartIntoUser($guestSessionId, $user);
            app(WishlistService::class)->mergeGuestWishlistIntoUser($guestSessionId, $user);
        }

        // Redirect admin/staff to admin dashboard, customers to intended or home
        if ($user->hasAdminAccess()) {
            return Inertia::location(route('admin.dashboard'));
        }

        $intendedUrl = redirect()->intended(route('home'))->getTargetUrl();

        return Inertia::location($intendedUrl);
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
    public function register(RegisterRequest $request): SymfonyResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => User::ROLE_CUSTOMER,
            'auth_provider' => 'local',
            'is_active' => true,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        $guestSessionId = $request->header('X-Cart-Session')
            ?: ($request->cookie('cart_session') ?: $request->session()->getId());

        Auth::login($user);

        if ($guestSessionId) {
            app(CartService::class)->mergeGuestCartIntoUser($guestSessionId, $user);
            app(WishlistService::class)->mergeGuestWishlistIntoUser($guestSessionId, $user);
        }

        $intendedUrl = redirect()->intended(route('home'))->getTargetUrl();

        return Inertia::location($intendedUrl);
    }

    /**
     * Redirect the user to Google OAuth authentication page.
     */
    public function redirectToGoogle(): RedirectResponse|SymfonyResponse
    {
        if (!class_exists(Socialite::class)) {
            return redirect()->route('register')->with('error', 'Google Sign-In package is not installed on the server yet. Please run "composer install" on the server or register with email.');
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()->route('register')->with('error', 'Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment or register using email and password.');
        }

        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the incoming Google OAuth callback.
     */
    public function handleGoogleCallback(Request $request): SymfonyResponse|RedirectResponse
    {
        if (!class_exists(Socialite::class)) {
            return redirect()->route('login')->with('error', 'Google Sign-In package is not installed on the server yet. Please run "composer install" on the server.');
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()->route('login')->with('error', 'Google Sign-In is not configured yet. Please sign in with email and password.');
        }

        try {
            /** @var \Laravel\Socialite\Two\User $googleUser */
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            report($e);
            return redirect()->route('login')->with('error', 'Unable to authenticate with Google. Please try again or use email and password.');
        }

        if (!$googleUser || empty($googleUser->getEmail())) {
            return redirect()->route('login')->with('error', 'No verified email was returned by Google. Please register manually.');
        }

        // 1. Find by google_id
        $user = User::where('google_id', $googleUser->getId())->first();

        // 2. Fallback: Find by email
        if (!$user) {
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Link account to Google
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'auth_provider' => $user->auth_provider === 'local' ? 'google' : $user->auth_provider,
                    'avatar' => $user->avatar ?: $googleUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?: now(),
                ]);
            } else {
                // 3. Create new customer user
                $user = User::create([
                    'name' => $googleUser->getName() ?: 'Customer',
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'auth_provider' => 'google',
                    'avatar' => $googleUser->getAvatar(),
                    'role' => User::ROLE_CUSTOMER,
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'password' => null,
                ]);

                event(new Registered($user));
            }
        }

        if (!$user->is_active) {
            return redirect()->route('login')->with('error', 'Your account has been deactivated. Please contact support.');
        }

        Auth::login($user, true);

        $guestSessionId = $request->header('X-Cart-Session')
            ?: ($request->cookie('cart_session') ?: $request->session()->getId());

        $request->session()->regenerate();

        if ($guestSessionId) {
            app(CartService::class)->mergeGuestCartIntoUser($guestSessionId, $user);
            app(WishlistService::class)->mergeGuestWishlistIntoUser($guestSessionId, $user);
        }

        if ($user->hasAdminAccess()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->intended(route('home'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): SymfonyResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('home'));
    }
}
