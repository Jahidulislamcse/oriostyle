<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Product;
use App\Models\User;
use App\Services\Storefront\CouponValidationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase15CouponTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $customerUser;
    protected Product $product;
    protected string $sessionId = 'guest-session-test-phase15';

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
        ]);

        $this->customerUser = User::factory()->create([
            'role' => User::ROLE_CUSTOMER,
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'name' => 'Signature Luxury Watch',
            'slug' => 'signature-luxury-watch-' . uniqid(),
            'sku' => 'SLW-' . uniqid(),
            'base_price' => 2000.00,
            'sale_price' => 1800.00,
            'stock_quantity' => 20,
            'is_active' => true,
        ]);
    }

    public function test_can_apply_percentage_coupon_and_calculate_discount(): void
    {
        $coupon = Coupon::create([
            'code' => 'SAVE15',
            'name' => '15% Off Everything',
            'discount_type' => 'percentage',
            'discount_value' => 15.00,
            'min_order_amount' => 1000.00,
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('SAVE15', 2000.00);

        $this->assertTrue($result['valid']);
        $this->assertEquals(300.00, $result['discount']); // 15% of 2000 = 300
    }

    public function test_can_apply_fixed_discount_coupon(): void
    {
        Coupon::create([
            'code' => 'FLAT250',
            'name' => 'Flat 250 Taka Off',
            'discount_type' => 'fixed',
            'discount_value' => 250.00,
            'min_order_amount' => 1000.00,
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('FLAT250', 1500.00);

        $this->assertTrue($result['valid']);
        $this->assertEquals(250.00, $result['discount']);
    }

    public function test_percentage_coupon_obeys_max_discount_cap(): void
    {
        Coupon::create([
            'code' => 'BIGSALE50',
            'name' => '50% Off Up to 400 BDT',
            'discount_type' => 'percentage',
            'discount_value' => 50.00,
            'max_discount_cap' => 400.00,
            'min_order_amount' => 500.00,
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('BIGSALE50', 2000.00);

        // 50% of 2000 is 1000, but cap is 400
        $this->assertTrue($result['valid']);
        $this->assertEquals(400.00, $result['discount']);
    }

    public function test_coupon_cannot_be_applied_if_minimum_spend_not_met(): void
    {
        Coupon::create([
            'code' => 'VIP500',
            'name' => 'VIP 500 Off',
            'discount_type' => 'fixed',
            'discount_value' => 500.00,
            'min_order_amount' => 3000.00,
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('VIP500', 2500.00);

        $this->assertFalse($result['valid']);
        $this->assertEquals(0.00, $result['discount']);
        $this->assertStringContainsString('Minimum order amount', $result['message']);
    }

    public function test_expired_coupon_cannot_be_applied(): void
    {
        Coupon::create([
            'code' => 'PASTEXPIRED',
            'name' => 'Expired Coupon',
            'discount_type' => 'percentage',
            'discount_value' => 20.00,
            'start_date' => Carbon::now()->subMonths(2),
            'end_date' => Carbon::now()->subDays(2),
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('PASTEXPIRED', 2000.00);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('expired', $result['message']);
    }

    public function test_future_scheduled_coupon_cannot_be_applied(): void
    {
        Coupon::create([
            'code' => 'FUTUREPROMO',
            'name' => 'Future Promo',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'start_date' => Carbon::now()->addDays(5),
            'end_date' => Carbon::now()->addMonths(1),
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('FUTUREPROMO', 2000.00);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('not active yet', $result['message']);
    }

    public function test_inactive_coupon_cannot_be_applied(): void
    {
        Coupon::create([
            'code' => 'DISABLED10',
            'name' => 'Disabled Coupon',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'is_active' => false,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('DISABLED10', 2000.00);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('no longer active', $result['message']);
    }

    public function test_coupon_cannot_exceed_total_usage_limit(): void
    {
        Coupon::create([
            'code' => 'LIMITED100',
            'name' => 'Limited Coupon',
            'discount_type' => 'fixed',
            'discount_value' => 100.00,
            'usage_limit_total' => 1,
            'times_used' => 1,
            'is_active' => true,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('LIMITED100', 2000.00);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('maximum redemption limit', $result['message']);
    }

    public function test_coupon_cannot_exceed_per_user_usage_limit(): void
    {
        $coupon = Coupon::create([
            'code' => 'ONCEPERUSER',
            'name' => 'Once Per Customer',
            'discount_type' => 'fixed',
            'discount_value' => 100.00,
            'usage_limit_per_user' => 1,
            'is_active' => true,
        ]);

        CouponUsage::create([
            'coupon_id' => $coupon->id,
            'user_id' => $this->customerUser->id,
            'discount_amount' => 100.00,
        ]);

        $service = app(CouponValidationService::class);
        $result = $service->validate('ONCEPERUSER', 2000.00, $this->customerUser);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('maximum usage limit', $result['message']);
    }

    public function test_guest_can_apply_and_remove_coupon_via_mini_cart_api(): void
    {
        // 1. Add item to cart first (1800 BDT)
        $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        Coupon::create([
            'code' => 'CARTDISCOUNT',
            'name' => 'Cart 10% Discount',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'min_order_amount' => 1000.00,
            'is_active' => true,
        ]);

        // 2. Apply coupon
        $applyRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.coupon.apply'), [
                'code' => 'CARTDISCOUNT',
            ]);

        $applyRes->assertOk();
        $applyRes->assertJson([
            'success' => true,
            'discount' => 180.00, // 10% of 1800
            'cart' => [
                'subtotal' => 1800.00,
                'discount_amount' => 180.00,
                'grand_total' => 1620.00,
                'coupon' => [
                    'code' => 'CARTDISCOUNT',
                ],
            ],
        ]);

        $cart = Cart::where('session_id', $this->sessionId)->first();
        $this->assertEquals('CARTDISCOUNT', $cart->coupon_code);

        // 3. Remove coupon
        $removeRes = $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->deleteJson(route('cart.coupon.remove'));

        $removeRes->assertOk();
        $removeRes->assertJson([
            'success' => true,
            'cart' => [
                'subtotal' => 1800.00,
                'discount_amount' => 0.00,
                'grand_total' => 1800.00,
                'coupon' => null,
            ],
        ]);

        $this->assertNull($cart->fresh()->coupon_code);
    }

    public function test_applying_coupon_via_inertia_returns_redirect_with_success(): void
    {
        $this->withHeaders(['X-Cart-Session' => $this->sessionId])
            ->postJson(route('cart.items.store'), [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        Coupon::create([
            'code' => 'INERTIA10',
            'name' => 'Inertia Promo',
            'discount_type' => 'fixed',
            'discount_value' => 100.00,
            'is_active' => true,
        ]);

        $response = $this->from('/shop')
            ->withHeaders([
                'X-Inertia' => 'true',
                'X-Requested-With' => 'XMLHttpRequest',
                'X-Cart-Session' => $this->sessionId,
            ])
            ->post(route('cart.coupon.apply'), [
                'code' => 'INERTIA10',
            ]);

        $response->assertRedirect('/shop');
        $response->assertSessionHas('success');
    }

    public function test_admin_can_view_coupons_index_with_statistics(): void
    {
        Coupon::create([
            'code' => 'ADMINCODE1',
            'name' => 'Admin Coupon One',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('admin.coupons.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Coupons/Index')
            ->has('coupons.data', 1)
            ->has('stats.total')
            ->has('stats.active')
        );
    }

    public function test_admin_can_create_coupon(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('admin.coupons.store'), [
                'code' => 'SPRING2026',
                'name' => 'Spring Gala Discount',
                'description' => 'Special promo code for spring season',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'min_order_amount' => 1500.00,
                'max_discount_cap' => 500.00,
                'usage_limit_total' => 200,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('admin.coupons.index'));

        $this->assertDatabaseHas('coupons', [
            'code' => 'SPRING2026',
            'name' => 'Spring Gala Discount',
            'discount_type' => 'percentage',
            'discount_value' => 20.00,
            'max_discount_cap' => 500.00,
        ]);
    }

    public function test_admin_can_update_coupon(): void
    {
        $coupon = Coupon::create([
            'code' => 'OLDCODE',
            'name' => 'Old Name',
            'discount_type' => 'fixed',
            'discount_value' => 100.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->put(route('admin.coupons.update', $coupon->id), [
                'code' => 'NEWCODE',
                'name' => 'New Updated Name',
                'discount_type' => 'fixed',
                'discount_value' => 150.00,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('admin.coupons.index'));

        $this->assertDatabaseHas('coupons', [
            'id' => $coupon->id,
            'code' => 'NEWCODE',
            'discount_value' => 150.00,
        ]);
    }

    public function test_admin_can_toggle_coupon_active_status(): void
    {
        $coupon = Coupon::create([
            'code' => 'TOGGLEME',
            'name' => 'Toggle Coupon',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->patch(route('admin.coupons.toggle-active', $coupon->id));

        $response->assertRedirect();
        $this->assertFalse((bool) $coupon->fresh()->is_active);

        // Toggle back to active
        $this->actingAs($this->adminUser)
            ->patch(route('admin.coupons.toggle-active', $coupon->id));

        $this->assertTrue((bool) $coupon->fresh()->is_active);
    }

    public function test_admin_can_delete_coupon(): void
    {
        $coupon = Coupon::create([
            'code' => 'DELETEME',
            'name' => 'To Delete',
            'discount_type' => 'percentage',
            'discount_value' => 5.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->delete(route('admin.coupons.destroy', $coupon->id));

        $response->assertRedirect(route('admin.coupons.index'));
        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
    }

    public function test_customer_cannot_access_admin_coupons(): void
    {
        $response = $this->actingAs($this->customerUser)
            ->get(route('admin.coupons.index'));

        $response->assertForbidden();
    }
}
