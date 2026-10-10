<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\HomepageBentoSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HomepageBentoTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;
    private Category $category;
    private HomepageBentoSlot $slot;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'super_admin']);
        $this->customer = User::factory()->create(['role' => 'customer']);

        $this->category = Category::create([
            'name' => 'Royal Panjabi',
            'slug' => 'royal-panjabi',
            'is_active' => true,
        ]);

        $this->slot = HomepageBentoSlot::create([
            'slot_key' => 'top_left_tall',
            'category_id' => $this->category->id,
            'title' => 'ROYAL PANJABI',
            'image_path' => '/storefront/img/category/1.jpg',
            'aspect_ratio' => 'tall',
            'recommended_dimensions' => '600 × 780px',
            'has_arrow' => false,
            'dark_badge' => false,
            'is_active' => true,
            'display_order' => 1,
        ]);
    }

    public function test_admin_can_view_bento_manager(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/homepage-bento');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Banners/BentoManager')
            ->has('slots')
            ->has('categories')
        );
    }

    public function test_admin_can_update_bento_slot(): void
    {
        $newCategory = Category::create([
            'name' => 'Luxury Silk Sarees',
            'slug' => 'luxury-silk-sarees',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->post("/admin/homepage-bento/{$this->slot->id}", [
            'category_id' => $newCategory->id,
            'title' => 'EXCLUSIVE SILK SAREES',
            'has_arrow' => true,
            'dark_badge' => true,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->slot->refresh();
        $this->assertEquals($newCategory->id, $this->slot->category_id);
        $this->assertEquals('EXCLUSIVE SILK SAREES', $this->slot->title);
        $this->assertTrue($this->slot->has_arrow);
        $this->assertTrue($this->slot->dark_badge);
    }

    public function test_admin_can_upload_bento_slot_image(): void
    {
        Storage::fake('public');

        $fakeImage = UploadedFile::fake()->image('bento_photo.jpg', 600, 780);

        $response = $this->actingAs($this->admin)->post("/admin/homepage-bento/{$this->slot->id}", [
            'category_id' => $this->category->id,
            'title' => 'UPDATED TITLE',
            'image' => $fakeImage,
        ]);

        $response->assertRedirect();

        $this->slot->refresh();
        $this->assertNotNull($this->slot->image_path);
        $this->assertStringStartsWith('bento/', $this->slot->image_path);
        Storage::disk('public')->assertExists($this->slot->image_path);
    }

    public function test_admin_can_toggle_slot_active(): void
    {
        $this->assertTrue($this->slot->is_active);

        $response = $this->actingAs($this->admin)->patch("/admin/homepage-bento/{$this->slot->id}/toggle-active");
        $response->assertRedirect();

        $this->slot->refresh();
        $this->assertFalse($this->slot->is_active);

        $this->actingAs($this->admin)->patch("/admin/homepage-bento/{$this->slot->id}/toggle-active");
        $this->slot->refresh();
        $this->assertTrue($this->slot->is_active);
    }

    public function test_storefront_homepage_renders_bento_slots(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Storefront/Index')
            ->has('bentoSlots')
        );
    }

    public function test_non_admin_cannot_access_bento_manager(): void
    {
        $this->get('/admin/homepage-bento')->assertRedirect('/login');

        $this->actingAs($this->customer)->get('/admin/homepage-bento')->assertStatus(403);
    }
}
