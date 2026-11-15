<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the admin login screen can be rendered.
     */
    public function test_admin_login_screen_can_be_rendered(): void
    {
        $response = $this->get(route('admin.login'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Auth/Login'));
    }

    /**
     * Test that an admin in the admins table can authenticate via admin login.
     */
    public function test_admin_can_authenticate_via_admin_login(): void
    {
        $admin = Admin::factory()->create([
            'email' => 'storemanager@orio.com',
            'password' => Hash::make('secret1234'),
            'role' => Admin::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'storemanager@orio.com',
            'password' => 'secret1234',
        ]);

        $this->assertAuthenticatedAs($admin, 'admin');
        $response->assertRedirect(route('admin.dashboard'));
    }

    /**
     * Test that admin authentication fails with invalid password.
     */
    public function test_admin_cannot_authenticate_with_invalid_password(): void
    {
        Admin::factory()->create([
            'email' => 'storemanager@orio.com',
            'password' => Hash::make('secret1234'),
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'storemanager@orio.com',
            'password' => 'wrongpassword',
        ]);

        $this->assertGuest('admin');
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that inactive admin accounts are blocked from logging in.
     */
    public function test_inactive_admin_cannot_authenticate(): void
    {
        Admin::factory()->create([
            'email' => 'inactive@orio.com',
            'password' => Hash::make('secret1234'),
            'is_active' => false,
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'inactive@orio.com',
            'password' => 'secret1234',
        ]);

        $this->assertGuest('admin');
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that storefront customers in the users table cannot login at /admin/login.
     */
    public function test_regular_customer_cannot_authenticate_at_admin_login(): void
    {
        User::factory()->create([
            'email' => 'shopper@gmail.com',
            'password' => Hash::make('customerpass'),
            'role' => User::ROLE_CUSTOMER,
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'shopper@gmail.com',
            'password' => 'customerpass',
        ]);

        $this->assertGuest('admin');
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that admin can log out via /admin/logout and is redirected to /admin/login.
     */
    public function test_admin_can_logout_and_is_redirected_to_admin_login(): void
    {
        $admin = Admin::factory()->create([
            'role' => Admin::ROLE_ADMIN,
        ]);

        $response = $this->actingAs($admin, 'admin')->post(route('admin.logout'));

        $this->assertGuest('admin');
        $response->assertRedirect(route('admin.login'));
    }

    /**
     * Test that unauthenticated user accessing admin area is redirected to /admin/login.
     */
    public function test_unauthenticated_user_accessing_admin_dashboard_redirects_to_admin_login(): void
    {
        $response = $this->get(route('admin.dashboard'));

        $response->assertRedirect(route('admin.login'));
    }

    /**
     * Test that an already authenticated admin visiting /admin/login redirects to dashboard.
     */
    public function test_authenticated_admin_visiting_admin_login_redirects_to_dashboard(): void
    {
        $admin = Admin::factory()->create([
            'role' => Admin::ROLE_SUPER_ADMIN,
        ]);

        $response = $this->actingAs($admin, 'admin')->get(route('admin.login'));

        $response->assertRedirect(route('admin.dashboard'));
    }
}
