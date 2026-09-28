<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Services\Settings\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase5SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected SettingService $settingService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->settingService = app(SettingService::class);

        $this->admin = User::factory()->create([
            'name' => 'Lead System Admin',
            'email' => 'admin@oriostyle.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->customer = User::factory()->create([
            'name' => 'Shopper User',
            'email' => 'customer@gmail.com',
            'role' => 'customer',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_settings_index_page_with_system_diagnostics(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.settings.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Settings/Index')
            ->has('settings')
            ->has('system')
            ->where('settings.site_name', 'ORIO STYLE LTD')
            ->where('settings.currency_symbol', '৳')
            ->has('system.phpVersion')
            ->has('system.laravelVersion')
            ->has('system.cacheDriver')
        );
    }

    public function test_admin_can_update_general_identity_and_contact_settings_with_cache_invalidation(): void
    {
        $payload = [
            'site_name' => 'ORIO LUXURY BOUTIQUE',
            'site_tagline' => 'Finest Handcrafted Apparel',
            'support_phone' => '+880 1899-112233',
            'whatsapp_number' => '+880 1899-112233',
            'support_email' => 'concierge@orioluxury.com',
            'store_address' => 'Gulshan Avenue, Dhaka, Bangladesh',
            'currency_symbol' => '৳',
            'currency_code' => 'BDT',
            'currency_position' => 'left',
            'shipping_charge_inside' => 80,
            'shipping_charge_outside' => 150,
            'free_shipping_threshold' => 3000,
            'vat_percentage' => 5.0,
            'vat_inclusive' => true,
            'legal_company_name' => 'ORIO Luxury Holdings Ltd.',
            'tax_bin_number' => 'BIN-99887766',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.settings.update'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify database records
        $this->assertDatabaseHas('settings', [
            'key' => 'site_name',
            'value' => 'ORIO LUXURY BOUTIQUE',
        ]);

        $this->assertDatabaseHas('settings', [
            'key' => 'support_email',
            'value' => 'concierge@orioluxury.com',
        ]);

        // Verify service retrieval from cache
        $this->assertEquals('ORIO LUXURY BOUTIQUE', $this->settingService->get('site_name'));
        $this->assertEquals('+880 1899-112233', $this->settingService->get('support_phone'));
        $this->assertEquals(80.0, (float) $this->settingService->get('shipping_charge_inside'));
        $this->assertTrue((bool) $this->settingService->get('vat_inclusive'));
    }

    public function test_admin_can_upload_brand_logo_and_favicon(): void
    {
        Storage::fake('public');

        $logoFile = UploadedFile::fake()->image('brand_logo.png', 400, 150);
        $faviconFile = UploadedFile::fake()->image('favicon.png', 32, 32);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.settings.update'), [
                'site_name' => 'ORIO STYLE LTD',
                'site_logo' => $logoFile,
                'site_favicon' => $faviconFile,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $storedLogo = $this->settingService->get('site_logo');
        $storedFavicon = $this->settingService->get('site_favicon');

        $this->assertNotNull($storedLogo);
        $this->assertStringStartsWith('/storage/settings/site_logo_', $storedLogo);

        $this->assertNotNull($storedFavicon);
        $this->assertStringStartsWith('/storage/settings/site_favicon_', $storedFavicon);

        $relativeLogoPath = str_replace('/storage/', '', $storedLogo);
        Storage::disk('public')->assertExists($relativeLogoPath);
    }

    public function test_admin_can_remove_uploaded_logo_via_removal_flag(): void
    {
        Storage::fake('public');

        // First upload logo
        $logoFile = UploadedFile::fake()->image('brand_logo.png', 400, 150);
        $this->settingService->uploadSettingFile($logoFile, 'site_logo', 'general');

        $this->assertNotNull($this->settingService->get('site_logo'));

        // Now remove it
        $response = $this->actingAs($this->admin)
            ->post(route('admin.settings.update'), [
                'site_name' => 'ORIO STYLE LTD',
                'remove_site_logo' => true,
            ]);

        $response->assertRedirect();
        $this->assertNull($this->settingService->get('site_logo'));
    }

    public function test_admin_can_manually_clear_settings_cache(): void
    {
        Cache::put(SettingService::CACHE_KEY, ['site_name' => 'Stale Cached Name'], 3600);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.settings.clear-cache'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertFalse(Cache::has(SettingService::CACHE_KEY));
    }

    public function test_customer_cannot_access_or_update_settings(): void
    {
        // Customer access to index
        $indexResponse = $this->actingAs($this->customer)
            ->get(route('admin.settings.index'));

        $indexResponse->assertForbidden();

        // Customer update attempt
        $updateResponse = $this->actingAs($this->customer)
            ->post(route('admin.settings.update'), [
                'site_name' => 'Hacked Name',
            ]);

        $updateResponse->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('admin.settings.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_inertia_middleware_shares_settings_globally_to_storefront_pages(): void
    {
        $this->settingService->set('site_name', 'ORIO COUTURE', 'general');

        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->where('appName', 'ORIO COUTURE')
            ->where('settings.site_name', 'ORIO COUTURE')
        );
    }
}
