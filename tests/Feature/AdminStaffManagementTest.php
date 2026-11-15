<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminStaffManagementTest extends TestCase
{
    use RefreshDatabase;

    private Admin $superAdmin;
    private Admin $regularAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = Admin::create([
            'name' => 'Root Sovereign',
            'email' => 'super@orio.test',
            'password' => Hash::make('password123'),
            'role' => Admin::ROLE_SUPER_ADMIN,
            'is_active' => true,
            'permissions' => array_keys(Admin::ALL_PERMISSIONS),
        ]);

        $this->regularAdmin = Admin::create([
            'name' => 'Store Operations',
            'email' => 'admin@orio.test',
            'password' => Hash::make('password123'),
            'role' => Admin::ROLE_ADMIN,
            'is_active' => true,
            'permissions' => [Admin::PERMISSION_MANAGE_PRODUCTS, Admin::PERMISSION_MANAGE_ORDERS],
        ]);
    }

    public function test_super_admin_can_view_staff_listing(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->get(route('admin.staff.index'));

        $response->assertOk();
    }

    public function test_regular_admin_is_forbidden_from_staff_management(): void
    {
        $response = $this->actingAs($this->regularAdmin, 'admin')
            ->get(route('admin.staff.index'));

        $response->assertForbidden();
    }

    public function test_storefront_customer_is_forbidden_from_staff_management(): void
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer, 'web')
            ->get(route('admin.staff.index'));

        $response->assertForbidden();
    }

    public function test_unauthenticated_guest_is_redirected_to_admin_login(): void
    {
        $response = $this->get(route('admin.staff.index'));

        $response->assertRedirect(route('admin.login'));
    }

    public function test_super_admin_can_create_new_staff_member(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->post(route('admin.staff.store'), [
                'name' => 'Inventory Chief',
                'email' => 'inventory@orio.test',
                'phone' => '+8801711223344',
                'role' => Admin::ROLE_INVENTORY_STAFF,
                'password' => 'SecurePass123!',
                'password_confirmation' => 'SecurePass123!',
                'is_active' => true,
                'permissions' => [
                    Admin::PERMISSION_MANAGE_PRODUCTS,
                    Admin::PERMISSION_MANAGE_INVENTORY,
                ],
            ]);

        $response->assertRedirect(route('admin.staff.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('admins', [
            'name' => 'Inventory Chief',
            'email' => 'inventory@orio.test',
            'role' => Admin::ROLE_INVENTORY_STAFF,
            'is_active' => true,
        ]);

        $created = Admin::where('email', 'inventory@orio.test')->first();
        $this->assertNotNull($created);
        $this->assertTrue(Hash::check('SecurePass123!', $created->password));
        $this->assertTrue($created->hasPermission(Admin::PERMISSION_MANAGE_PRODUCTS));
        $this->assertTrue($created->hasPermission(Admin::PERMISSION_MANAGE_INVENTORY));
        $this->assertFalse($created->hasPermission(Admin::PERMISSION_MANAGE_STAFF));
    }

    public function test_super_admin_can_update_staff_details_and_permissions(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->put(route('admin.staff.update', $this->regularAdmin->id), [
                'name' => 'Promoted Manager',
                'email' => 'promoted@orio.test',
                'phone' => '+8801700998877',
                'role' => Admin::ROLE_MANAGER,
                'is_active' => true,
                'permissions' => [
                    Admin::PERMISSION_MANAGE_PRODUCTS,
                    Admin::PERMISSION_MANAGE_ORDERS,
                    Admin::PERMISSION_MANAGE_REVIEWS,
                ],
            ]);

        $response->assertRedirect(route('admin.staff.index'));
        $response->assertSessionHas('success');

        $this->regularAdmin->refresh();
        $this->assertEquals('Promoted Manager', $this->regularAdmin->name);
        $this->assertEquals('promoted@orio.test', $this->regularAdmin->email);
        $this->assertEquals(Admin::ROLE_MANAGER, $this->regularAdmin->role);
        $this->assertTrue($this->regularAdmin->hasPermission(Admin::PERMISSION_MANAGE_REVIEWS));
    }

    public function test_super_admin_cannot_demote_themselves(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->put(route('admin.staff.update', $this->superAdmin->id), [
                'name' => 'Root Sovereign',
                'email' => 'super@orio.test',
                'role' => Admin::ROLE_ADMIN, // attempt demotion
                'is_active' => true,
            ]);

        $response->assertSessionHas('error');
        $this->superAdmin->refresh();
        $this->assertEquals(Admin::ROLE_SUPER_ADMIN, $this->superAdmin->role);
    }

    public function test_super_admin_cannot_deactivate_themselves(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->patch(route('admin.staff.toggle-active', $this->superAdmin->id));

        $response->assertSessionHas('error');
        $this->superAdmin->refresh();
        $this->assertTrue($this->superAdmin->is_active);
    }

    public function test_super_admin_can_toggle_active_status_of_other_staff(): void
    {
        $this->assertTrue($this->regularAdmin->is_active);

        $response = $this->actingAs($this->superAdmin, 'admin')
            ->patch(route('admin.staff.toggle-active', $this->regularAdmin->id));

        $response->assertSessionHas('success');
        $this->regularAdmin->refresh();
        $this->assertFalse($this->regularAdmin->is_active);
    }

    public function test_super_admin_cannot_delete_their_own_account(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->delete(route('admin.staff.destroy', $this->superAdmin->id));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('admins', ['id' => $this->superAdmin->id]);
    }

    public function test_super_admin_can_delete_other_staff_account(): void
    {
        $response = $this->actingAs($this->superAdmin, 'admin')
            ->delete(route('admin.staff.destroy', $this->regularAdmin->id));

        $response->assertRedirect(route('admin.staff.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('admins', ['id' => $this->regularAdmin->id]);
    }

    public function test_permission_helpers_on_admin_model(): void
    {
        // Super admin has all permissions unconditionally
        $this->assertTrue($this->superAdmin->hasPermission(Admin::PERMISSION_MANAGE_PRODUCTS));
        $this->assertTrue($this->superAdmin->hasPermission(Admin::PERMISSION_MANAGE_STAFF));
        $this->assertTrue($this->superAdmin->hasPermission('any_random_nonexistent_permission'));

        // Regular admin has only assigned permissions
        $this->assertTrue($this->regularAdmin->hasPermission(Admin::PERMISSION_MANAGE_PRODUCTS));
        $this->assertFalse($this->regularAdmin->hasPermission(Admin::PERMISSION_MANAGE_STAFF));

        // Inactive staff loses all permissions
        $this->regularAdmin->is_active = false;
        $this->regularAdmin->save();
        $this->assertFalse($this->regularAdmin->hasPermission(Admin::PERMISSION_MANAGE_PRODUCTS));
    }

    public function test_google_callback_alias_route_is_registered(): void
    {
        $this->assertTrue(\Illuminate\Support\Facades\Route::has('auth.google.callback'));
        $routes = collect(\Illuminate\Support\Facades\Route::getRoutes()->get('GET'));
        
        $hasAlias = $routes->contains(function ($route) {
            return $route->uri() === 'auth/google/callbac';
        });

        $this->assertTrue($hasAlias);
    }
}
