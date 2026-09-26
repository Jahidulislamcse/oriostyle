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
     * Test that super admin, manager, and inventory staff can access admin dashboard.
     */
    public function test_all_admin_roles_can_access_admin_dashboard(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $manager = User::factory()->manager()->create();
        $staff = User::factory()->inventoryStaff()->create();

        // Super Admin
        $this->actingAs($superAdmin)
            ->get('/admin/dashboard')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));

        // Manager
        $this->actingAs($manager)
            ->get('/admin/dashboard')
            ->assertStatus(200);

        // Staff
        $this->actingAs($staff)
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
}
