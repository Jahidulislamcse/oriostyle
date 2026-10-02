<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\LazyLoadingViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TestUserWithRelation extends User
{
    protected $table = 'users';

    public function parentUser(): BelongsTo
    {
        return $this->belongsTo(self::class, 'id', 'id');
    }
}

class Phase1BaselineSetupTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that AppServiceProvider enforces strict anti-N+1 rules in non-production.
     */
    public function test_anti_n_plus_one_lazy_loading_policy_is_strictly_enforced(): void
    {
        $this->assertTrue(
            Model::preventsLazyLoading(),
            'Anti-N+1 Policy Violation: Model::preventLazyLoading() is not active!'
        );

        $this->assertTrue(
            Model::preventsSilentlyDiscardingAttributes(),
            'Model::preventSilentlyDiscardingAttributes() is not active!'
        );

        $this->assertTrue(
            Model::preventsAccessingMissingAttributes(),
            'Model::preventAccessingMissingAttributes() is not active!'
        );
    }

    /**
     * Test that triggering an un-eager loaded relationship on a collection throws LazyLoadingViolationException.
     */
    public function test_triggering_un_eager_loaded_relationship_throws_lazy_loading_violation_exception(): void
    {
        // Create multiple records to simulate N+1 vulnerability scenario
        User::factory()->count(3)->create();

        // Retrieve models without eager loading
        $users = TestUserWithRelation::all();

        $this->expectException(LazyLoadingViolationException::class);

        // Attempting to lazy load relation on collection must throw LazyLoadingViolationException
        foreach ($users as $user) {
            $user->parentUser;
        }
    }

    /**
     * Test that eager loading relationships with 'with()' executes cleanly without violation.
     */
    public function test_eager_loaded_relationship_executes_cleanly_without_violation(): void
    {
        User::factory()->count(2)->create();

        // Query with explicit eager loading
        $users = TestUserWithRelation::with('parentUser')->get();

        $this->assertCount(2, $users);
        $this->assertTrue($users->first()->relationLoaded('parentUser'));
    }

    /**
     * Test that the root route renders the Storefront landing page.
     */
    public function test_root_route_renders_storefront_page(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertViewIs('storefront.index');
    }

    /**
     * Test that HandleInertiaRequests middleware shares flash message structure on Inertia pages.
     */
    public function test_inertia_middleware_shares_flash_props(): void
    {
        $response = $this->withSession([
            'success' => 'Operation successful!',
        ])->get('/login');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
            ->where('flash.success', 'Operation successful!')
        );
    }
}
