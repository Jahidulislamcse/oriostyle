<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase2AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the login screen can be rendered.
     */
    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
        );
    }

    /**
     * Test that the register screen can be rendered.
     */
    public function test_register_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Register')
        );
    }

    /**
     * Test that new customers can register with validated fields and are logged in.
     */
    public function test_new_customers_can_register_and_authenticate(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Customer',
            'email' => 'customer_test@orio.com',
            'phone' => '01712345678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();

        /** @var User $user */
        $user = auth()->user();
        $this->assertEquals(User::ROLE_CUSTOMER, $user->role);
        $this->assertTrue($user->is_active);

        $response->assertRedirect(route('home'));
    }

    /**
     * Test that customer login redirects to home.
     */
    public function test_customer_login_redirects_to_home(): void
    {
        $customer = User::factory()->customer()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => $customer->email,
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($customer);
        $response->assertRedirect(route('home'));
    }

    /**
     * Test that admin login redirects to the admin dashboard.
     */
    public function test_admin_login_redirects_to_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect(route('admin.dashboard'));
    }

    /**
     * Test that admin login via Inertia returns Inertia location response for full window navigation.
     */
    public function test_admin_login_via_inertia_returns_inertia_location_response(): void
    {
        $admin = User::factory()->admin()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->withHeaders(['X-Inertia' => 'true'])
            ->post('/login', [
                'email' => $admin->email,
                'password' => 'password123',
            ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertStatus(409);
        $response->assertHeader('X-Inertia-Location', route('admin.dashboard'));
    }

    /**
     * Test that super admin and admin can access admin dashboard.
     */
    public function test_super_admin_and_admin_roles_can_access_admin_dashboard(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $admin = User::factory()->admin()->create();

        // Super Admin
        $this->actingAs($superAdmin)
            ->get('/admin/dashboard')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));

        // Admin
        $this->actingAs($admin)
            ->get('/admin/dashboard')
            ->assertStatus(200);
    }

    /**
     * Test that customers cannot access the admin area and receive a 403 Forbidden.
     */
    public function test_customer_cannot_access_admin_dashboard_receives_403(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer)->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    /**
     * Test that unauthenticated guest users visiting admin area are redirected to login.
     */
    public function test_unauthenticated_user_visiting_admin_area_redirects_to_login(): void
    {
        $response = $this->get('/admin/dashboard');

        $response->assertRedirect('/login');
    }

    /**
     * Test that users cannot authenticate with incorrect password.
     */
    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('correct-password'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that deactivated/inactive users cannot login.
     */
    public function test_inactive_users_cannot_authenticate(): void
    {
        $inactiveUser = User::factory()->inactive()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => $inactiveUser->email,
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that authenticated users can log out.
     */
    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    /**
     * Test that Google OAuth redirect flashes an error if credentials are not configured.
     */
    public function test_google_redirect_returns_error_if_not_configured(): void
    {
        config(['services.google.client_id' => '']);
        config(['services.google.client_secret' => '']);

        $response = $this->get(route('auth.google'));

        $response->assertRedirect(route('register'));
        $response->assertSessionHas('error');
    }

    /**
     * Test that Google OAuth redirect redirects to Google consent endpoint when configured.
     */
    public function test_google_redirect_works_when_configured(): void
    {
        config(['services.google.client_id' => 'test-client-id']);
        config(['services.google.client_secret' => 'test-client-secret']);

        $response = $this->get(route('auth.google'));

        $response->assertStatus(302);
        $this->assertStringContainsString('accounts.google.com', $response->getTargetUrl());
    }

    /**
     * Test that Google OAuth callback creates a new customer user and logs them in.
     */
    public function test_google_callback_creates_and_authenticates_customer(): void
    {
        config(['services.google.client_id' => 'test-client-id']);
        config(['services.google.client_secret' => 'test-client-secret']);

        $abstractUser = \Mockery::mock(\Laravel\Socialite\Two\User::class);
        $abstractUser->shouldReceive('getId')->andReturn('google-unique-id-12345');
        $abstractUser->shouldReceive('getName')->andReturn('Google Customer');
        $abstractUser->shouldReceive('getEmail')->andReturn('google_customer@example.com');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar.jpg');

        $provider = \Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('user')->andReturn($abstractUser);

        \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.callback'));

        $this->assertAuthenticated();

        /** @var User $user */
        $user = auth()->user();
        $this->assertEquals('Google Customer', $user->name);
        $this->assertEquals('google_customer@example.com', $user->email);
        $this->assertEquals('google-unique-id-12345', $user->google_id);
        $this->assertEquals('google', $user->auth_provider);
        $this->assertEquals(User::ROLE_CUSTOMER, $user->role);
        $this->assertNotNull($user->email_verified_at);

        $response->assertRedirect(route('home'));
    }

    /**
     * Test that Google OAuth callback links to an existing customer account by email.
     */
    public function test_google_callback_links_to_existing_customer(): void
    {
        config(['services.google.client_id' => 'test-client-id']);
        config(['services.google.client_secret' => 'test-client-secret']);

        $existing = User::factory()->customer()->create([
            'email' => 'existing_customer@example.com',
            'google_id' => null,
            'auth_provider' => 'local',
        ]);

        $abstractUser = \Mockery::mock(\Laravel\Socialite\Two\User::class);
        $abstractUser->shouldReceive('getId')->andReturn('google-linked-id-999');
        $abstractUser->shouldReceive('getName')->andReturn('Existing Customer');
        $abstractUser->shouldReceive('getEmail')->andReturn('existing_customer@example.com');
        $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar2.jpg');

        $provider = \Mockery::mock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->shouldReceive('user')->andReturn($abstractUser);

        \Laravel\Socialite\Facades\Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.callback'));

        $this->assertAuthenticatedAs($existing);

        $existing->refresh();
        $this->assertEquals('google-linked-id-999', $existing->google_id);
        $this->assertEquals('google', $existing->auth_provider);

        $response->assertRedirect(route('home'));
    }
}
