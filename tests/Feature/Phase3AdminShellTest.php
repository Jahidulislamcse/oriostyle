<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Settings\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase3AdminShellTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that dynamic settings are seeded, cached, and shared globally in Inertia props.
     */
    public function test_dynamic_settings_are_cached_and_shared_globally_via_inertia(): void
    {
        $this->seed();

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->has('settings')
            ->where('settings.site_name', 'ORIO STYLE')
            ->where('settings.currency_symbol', '৳')
            ->where('settings.currency_code', 'BDT')
            ->has('settings.support_phone')
            ->has('settings.support_email')
        );
    }

    /**
     * Test that SettingService updates settings and immediately invalidates the cache.
     */
    public function test_setting_service_updates_settings_with_cache_invalidation(): void
    {
        /** @var SettingService $service */
        $service = app(SettingService::class);

        // Update site name and currency
        $service->set('site_name', 'ORIO ENTERPRISE LUXE', 'identity');
        $service->set('currency_symbol', '$', 'commerce');

        $this->assertEquals('ORIO ENTERPRISE LUXE', $service->get('site_name'));
        $this->assertEquals('$', $service->get('currency_symbol'));

        // Verify Inertia globally picks up the updated settings without hardcoding
        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('settings.site_name', 'ORIO ENTERPRISE LUXE')
            ->where('settings.currency_symbol', '$')
        );
    }

    /**
     * Test that Admin Dashboard renders inside AdminLayout with dynamic branding and metrics.
     */
    public function test_admin_dashboard_renders_with_admin_layout_and_dynamic_branding(): void
    {
        $this->seed();

        $admin = User::where('role', User::ROLE_ADMIN)->first();

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('user')
            ->has('metrics')
            ->where('user.email', $admin->email)
            ->where('user.role', User::ROLE_ADMIN)
            ->has('settings')
        );
    }

    /**
     * Test that flash session messages populate Inertia flash props for ToastContainer.
     */
    public function test_flash_messages_trigger_shared_toast_props(): void
    {
        $this->seed();
        $admin = User::where('role', User::ROLE_ADMIN)->first();

        $response = $this->actingAs($admin)->withSession([
            'success' => 'System settings updated successfully!',
        ])->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('flash.success', 'System settings updated successfully!')
        );
    }

    /**
     * Test that customer cannot access admin dashboard.
     */
    public function test_customer_cannot_access_admin_shell(): void
    {
        $this->seed();
        $customer = User::where('role', User::ROLE_CUSTOMER)->first();

        $response = $this->actingAs($customer)->get('/admin/dashboard');

        $response->assertStatus(403);
    }
}
