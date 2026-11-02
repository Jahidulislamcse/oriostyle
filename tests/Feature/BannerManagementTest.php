<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BannerManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->customer = User::factory()->create([
            'role' => 'customer',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_banners_index(): void
    {
        Banner::create([
            'title' => 'Hero Slide 1',
            'type' => 'hero',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.banners.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Banners/Index')
                ->has('banners.data')
                ->has('stats')
        );
    }

    public function test_admin_can_create_banner_with_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('banner_hero.jpg', 1920, 800);

        $response = $this->actingAs($this->admin)->post(route('admin.banners.store'), [
            'title' => 'Summer Special Drop',
            'subtitle' => 'Exclusive thobes & jubbas',
            'badge_text' => 'SPECIAL DROP',
            'button_text' => 'SHOP NOW',
            'link_url' => '/?category=thobe',
            'type' => 'hero',
            'display_order' => 1,
            'is_active' => true,
            'image' => $file,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'title' => 'Summer Special Drop',
            'type' => 'hero',
            'is_active' => true,
        ]);

        $banner = Banner::where('title', 'Summer Special Drop')->first();
        $this->assertNotNull($banner->image_path);
        Storage::disk('public')->assertExists($banner->image_path);
    }

    public function test_admin_can_create_banner_without_image(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.banners.store'), [
            'title' => 'Text Only Promo',
            'type' => 'promo',
            'display_order' => 0,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'title' => 'Text Only Promo',
            'type' => 'promo',
        ]);
    }

    public function test_admin_can_create_banner_with_null_image_field(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.banners.store'), [
            'title' => 'Null Image Promo',
            'type' => 'hero',
            'display_order' => 0,
            'is_active' => 1,
            'image' => null,
            'image_path' => '',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'title' => 'Null Image Promo',
        ]);
    }

    public function test_admin_can_update_banner_with_post_method_spoofing(): void
    {
        $banner = Banner::create([
            'title' => 'Old Title',
            'type' => 'hero',
            'display_order' => 0,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.banners.update', $banner), [
            '_method' => 'PUT',
            'title' => 'Spoofed PUT Title',
            'type' => 'hero',
            'display_order' => 2,
            'is_active' => 1,
            'image' => null,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'id' => $banner->id,
            'title' => 'Spoofed PUT Title',
            'display_order' => 2,
        ]);
    }

    public function test_admin_can_update_banner(): void
    {
        $banner = Banner::create([
            'title' => 'Old Title',
            'type' => 'split',
            'display_order' => 2,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.banners.update', $banner), [
            'title' => 'Updated Banner Title',
            'subtitle' => 'Updated Subtitle',
            'type' => 'split',
            'display_order' => 5,
            'is_active' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'id' => $banner->id,
            'title' => 'Updated Banner Title',
            'is_active' => false,
            'display_order' => 5,
        ]);
    }

    public function test_admin_can_update_banner_with_new_image(): void
    {
        Storage::fake('public');

        $banner = Banner::create([
            'title' => 'Initial Title',
            'type' => 'hero',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $newImage = UploadedFile::fake()->image('updated_banner.png', 800, 400);

        $response = $this->actingAs($this->admin)->post(route('admin.banners.update', $banner), [
            '_method' => 'PUT',
            'title' => 'Updated Banner With Image',
            'type' => 'hero',
            'display_order' => 1,
            'is_active' => 1,
            'image' => $newImage,
        ]);

        $response->assertRedirect();
        $banner->refresh();
        $this->assertEquals('Updated Banner With Image', $banner->title);
        $this->assertNotNull($banner->image_path);
        Storage::disk('public')->assertExists($banner->image_path);
    }

    public function test_admin_can_update_banner_and_remove_existing_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('old_banner.jpg', 600, 300);
        $path = $file->store('banners', 'public');

        $banner = Banner::create([
            'title' => 'With Old Image',
            'type' => 'split',
            'image_path' => $path,
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.banners.update', $banner), [
            '_method' => 'PUT',
            'title' => 'Removed Image Title',
            'type' => 'split',
            'display_order' => 1,
            'is_active' => 1,
            'remove_image' => 1,
        ]);

        $response->assertRedirect();
        $banner->refresh();
        $this->assertEquals('Removed Image Title', $banner->title);
        $this->assertNull($banner->image_path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_admin_can_toggle_banner_active_status(): void
    {
        $banner = Banner::create([
            'title' => 'Toggle Me',
            'type' => 'hero',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->patch(route('admin.banners.toggle-active', $banner));

        $response->assertRedirect();
        $this->assertDatabaseHas('banners', [
            'id' => $banner->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_delete_banner(): void
    {
        $banner = Banner::create([
            'title' => 'Delete Me',
            'type' => 'hero',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.banners.destroy', $banner));

        $response->assertRedirect();
        $this->assertDatabaseMissing('banners', [
            'id' => $banner->id,
        ]);
    }

    public function test_customer_cannot_access_banners_admin(): void
    {
        $response = $this->actingAs($this->customer)->get(route('admin.banners.index'));
        $response->assertStatus(403);
    }

    public function test_storefront_receives_active_banners(): void
    {
        Banner::create([
            'title' => 'Homepage Live Slide',
            'type' => 'hero',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Storefront/Index')
                ->has('heroBanners')
                ->has('splitBanners')
        );
    }
}
