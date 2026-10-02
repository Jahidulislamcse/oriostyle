<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryImage;
use App\Models\User;
use App\Services\Catalog\CategoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase4CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'email' => 'admin@orio.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->customerUser = User::factory()->create([
            'email' => 'customer@orio.com',
            'role' => 'customer',
            'is_active' => true,
        ]);
    }

    public function test_categories_index_renders_with_hierarchy_and_metrics_for_admin(): void
    {
        $root = Category::create([
            'name' => "Men's Fashion",
            'slug' => 'mens-fashion',
            'is_active' => true,
            'is_featured' => true,
        ]);

        Category::create([
            'parent_id' => $root->id,
            'name' => 'Formal Shirts',
            'slug' => 'formal-shirts',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.categories.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Categories/Index')
                ->has('categories', 2)
                ->has('parentOptions')
                ->has('stats')
                ->where('stats.total', 2)
                ->where('stats.root_count', 1)
                ->where('stats.sub_count', 1)
        );
    }

    public function test_anti_n_plus_one_eager_loading_when_rendering_category_tree(): void
    {
        $root = Category::create([
            'name' => 'Footwear',
            'slug' => 'footwear',
        ]);

        Category::create([
            'parent_id' => $root->id,
            'name' => 'Sneakers',
            'slug' => 'sneakers',
        ]);

        $service = app(CategoryService::class);
        $list = $service->getAdminCategoriesList();

        $this->assertNotEmpty($list);
        // Verify relationship is loaded without lazy loading violation
        $this->assertTrue($list->firstWhere('slug', 'sneakers')->relationLoaded('parent'));
    }

    public function test_admin_can_create_root_category_with_auto_generated_slug(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.categories.store'), [
                'name' => 'Ethnic Wear',
                'description' => 'Festive traditional attire',
                'display_order' => 1,
                'is_active' => true,
                'is_featured' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'name' => 'Ethnic Wear',
            'slug' => 'ethnic-wear',
            'parent_id' => null,
            'is_active' => true,
            'is_featured' => true,
        ]);
    }

    public function test_admin_can_create_nested_subcategory(): void
    {
        $root = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.categories.store'), [
                'name' => 'Smartphones',
                'slug' => 'smartphones-custom',
                'parent_id' => $root->id,
                'display_order' => 2,
                'is_active' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'name' => 'Smartphones',
            'slug' => 'smartphones-custom',
            'parent_id' => $root->id,
        ]);
    }

    public function test_category_slug_uniqueness_is_enforced(): void
    {
        Category::create([
            'name' => 'Watches',
            'slug' => 'watches',
        ]);

        // Attempting to submit duplicate slug manually should fail validation
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.categories.store'), [
                'name' => 'Smart Watches',
                'slug' => 'watches',
            ]);

        $response->assertSessionHasErrors(['slug']);
    }

    public function test_admin_can_update_category_attributes(): void
    {
        $category = Category::create([
            'name' => 'Winter Coats',
            'slug' => 'winter-coats',
            'display_order' => 5,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.categories.update', $category->id), [
                'name' => 'Premium Winter Coats',
                'slug' => 'winter-coats',
                'display_order' => 10,
                'is_active' => true,
                'is_featured' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $category->refresh();
        $this->assertEquals('Premium Winter Coats', $category->name);
        $this->assertEquals(10, $category->display_order);
        $this->assertTrue($category->is_featured);
    }

    public function test_circular_parent_relationship_is_prevented(): void
    {
        $root = Category::create([
            'name' => 'Apparel',
            'slug' => 'apparel',
        ]);

        $child = Category::create([
            'parent_id' => $root->id,
            'name' => 'T-Shirts',
            'slug' => 't-shirts',
        ]);

        // Attempting to set child as parent of root should fail validation or exception
        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.categories.update', $root->id), [
                'name' => 'Apparel',
                'slug' => 'apparel',
                'parent_id' => $child->id,
            ]);

        $response->assertSessionHasErrors(['parent_id']);
    }

    public function test_admin_can_toggle_category_active_status(): void
    {
        $category = Category::create([
            'name' => 'Jewelry',
            'slug' => 'jewelry',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.categories.toggle-active', $category->id));

        $response->assertRedirect();
        $this->assertFalse($category->fresh()->is_active);

        $this->actingAs($this->adminUser)
            ->patch(route('admin.categories.toggle-active', $category->id));

        $this->assertTrue($category->fresh()->is_active);
    }

    public function test_admin_can_toggle_category_featured_status(): void
    {
        $category = Category::create([
            'name' => 'Luxury Items',
            'slug' => 'luxury-items',
            'is_featured' => false,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.categories.toggle-featured', $category->id));

        $response->assertRedirect();
        $this->assertTrue($category->fresh()->is_featured);
    }

    public function test_deleting_parent_preserves_subcategories_by_shifting_parent_id(): void
    {
        $root = Category::create([
            'name' => 'Hardware',
            'slug' => 'hardware',
        ]);

        $child = Category::create([
            'parent_id' => $root->id,
            'name' => 'Tools',
            'slug' => 'tools',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.categories.destroy', $root->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('categories', ['id' => $root->id]);

        $child->refresh();
        $this->assertNull($child->parent_id);
    }

    public function test_customer_or_guest_cannot_access_categories_management(): void
    {
        // Unauthenticated guest
        $guestResponse = $this->get(route('admin.categories.index'));
        $guestResponse->assertRedirect(route('login'));

        // Customer
        $customerResponse = $this->actingAs($this->customerUser)
            ->get(route('admin.categories.index'));
        $customerResponse->assertForbidden();
    }

    public function test_admin_can_create_category_with_up_to_3_images_and_mark_featured(): void
    {
        Storage::fake('public');

        $images = [
            UploadedFile::fake()->image('cat1.jpg', 600, 600),
            UploadedFile::fake()->image('cat2.jpg', 600, 600),
            UploadedFile::fake()->image('cat3.jpg', 600, 600),
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.categories.store'), [
                'name' => 'Footwear & Boots',
                'description' => 'Premium luxury leather boots',
                'display_order' => 2,
                'is_active' => true,
                'is_featured' => true,
                'images' => $images,
                'featured_image_index' => 1, // 2nd image marked as featured
            ]);

        $response->assertRedirect();
        $category = Category::where('name', 'Footwear & Boots')->first();
        $this->assertNotNull($category);

        $this->assertCount(3, $category->images);
        $this->assertEquals(3, CategoryImage::where('category_id', $category->id)->count());

        $featured = $category->featuredImage;
        $this->assertNotNull($featured);
        $this->assertTrue((bool) $featured->is_featured);
        $this->assertEquals(1, $featured->display_order);
    }

    public function test_admin_can_create_subcategory_with_images_and_featured_flag(): void
    {
        Storage::fake('public');

        $parent = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'is_active' => true,
        ]);

        $images = [
            UploadedFile::fake()->image('sub1.jpg', 400, 400),
            UploadedFile::fake()->image('sub2.jpg', 400, 400),
        ];

        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.categories.store'), [
                'parent_id' => $parent->id,
                'name' => 'Smart Watches',
                'description' => 'Wearable smart tech',
                'images' => $images,
                'featured_image_index' => 0,
            ]);

        $response->assertRedirect();
        $sub = Category::where('name', 'Smart Watches')->first();
        $this->assertNotNull($sub);
        $this->assertEquals($parent->id, $sub->parent_id);
        $this->assertCount(2, $sub->images);
        $this->assertTrue((bool) $sub->featuredImage->is_featured);
    }

    public function test_admin_can_update_category_images_and_change_featured(): void
    {
        Storage::fake('public');

        $category = Category::create([
            'name' => 'Leather Bags',
            'slug' => 'leather-bags',
            'is_active' => true,
        ]);

        $img1 = CategoryImage::create([
            'category_id' => $category->id,
            'image_path' => 'categories/bag1.jpg',
            'is_featured' => true,
            'display_order' => 0,
        ]);

        $newImage = UploadedFile::fake()->image('bag2.jpg', 400, 400);

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.categories.update', $category->id), [
                'name' => 'Luxury Leather Bags',
                'images' => [$newImage],
                'featured_image_index' => 0, // mark the newly uploaded image as featured
                'deleted_image_ids' => [$img1->id],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('category_images', ['id' => $img1->id]);

        $category->refresh();
        $this->assertCount(1, $category->images);
        $this->assertTrue((bool) $category->featuredImage->is_featured);
    }

    public function test_category_service_caches_and_invalidates_storefront_nav_tree(): void
    {
        $service = app(CategoryService::class);

        Category::create([
            'name' => 'Beauty',
            'slug' => 'beauty',
            'is_active' => true,
        ]);

        $tree1 = $service->getStorefrontNavTree();
        $this->assertTrue(Cache::has(CategoryService::CACHE_STOREFRONT_TREE_KEY));

        // Update category -> cache should be cleared
        $service->createCategory([
            'name' => 'Fragrances',
            'slug' => 'fragrances',
            'is_active' => true,
        ]);

        $this->assertFalse(Cache::has(CategoryService::CACHE_STOREFRONT_TREE_KEY));
    }
}
