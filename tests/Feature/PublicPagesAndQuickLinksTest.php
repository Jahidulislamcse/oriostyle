<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Settings\SettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPagesAndQuickLinksTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private SettingService $settingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'super_admin']);
        $this->settingService = app(SettingService::class);
    }

    public function test_about_us_page_renders_successfully(): void
    {
        $response = $this->get('/about-us');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Pages/About')
            ->has('settings')
            ->where('settings.about_title', 'About ORIO STYLE')
        );

        // Test alias redirect
        $this->get('/about')->assertRedirect('/about-us');
    }

    public function test_store_locator_page_renders_successfully_with_locations(): void
    {
        $response = $this->get('/store-locator');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Pages/StoreLocator')
            ->has('settings')
            ->has('locations')
        );
    }

    public function test_blogs_page_renders_successfully_with_editorial_articles(): void
    {
        $response = $this->get('/blogs');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Pages/Blogs')
            ->has('settings')
            ->has('posts')
        );

        // Test alias redirect
        $this->get('/blog')->assertRedirect('/blogs');
    }

    public function test_terms_of_service_page_renders_successfully(): void
    {
        $response = $this->get('/terms-of-service');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Pages/Terms')
            ->has('settings')
            ->where('settings.terms_title', 'Terms of Service')
        );

        // Test alias redirect
        $this->get('/terms')->assertRedirect('/terms-of-service');
    }

    public function test_privacy_policy_page_renders_successfully(): void
    {
        $response = $this->get('/privacy-policy');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Pages/Privacy')
            ->has('settings')
            ->where('settings.privacy_title', 'Privacy Policy')
        );

        // Test alias redirect
        $this->get('/privacy')->assertRedirect('/privacy-policy');
    }

    public function test_refund_policy_page_renders_successfully(): void
    {
        $response = $this->get('/refund-policy');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Pages/Refund')
            ->has('settings')
            ->where('settings.refund_title', 'Refund, Return & Exchange Policy')
        );

        // Test alias redirect
        $this->get('/refund')->assertRedirect('/refund-policy');
    }

    public function test_admin_can_update_quick_links_and_dynamic_page_content(): void
    {
        $payload = [
            'link_store_locator' => '/store-locator',
            'link_about_us' => '/about-us',
            'about_title' => 'Custom ORIO Haute Couture',
            'about_content' => 'Our custom edited brand story.',
            'terms_title' => 'Updated Terms 2026',
            'terms_content' => 'Updated clause 1 and 2.',
            'refund_title' => 'Express 14-Day Return Policy',
            'refund_content' => 'Exchanges valid for 14 days.',
        ];

        $response = $this->actingAs($this->admin)->post('/admin/settings', $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Verify updated values in settings service
        $this->assertEquals('Custom ORIO Haute Couture', $this->settingService->get('about_title'));
        $this->assertEquals('Express 14-Day Return Policy', $this->settingService->get('refund_title'));

        // Verify page renders with updated dynamic content
        $aboutResponse = $this->get('/about-us');
        $aboutResponse->assertInertia(fn (Assert $page) => $page
            ->where('settings.about_title', 'Custom ORIO Haute Couture')
        );
    }
}
