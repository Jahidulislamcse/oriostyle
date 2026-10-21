<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons with statistics and filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status', 'all');

        $query = Coupon::query()->withCount('usages')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $coupons = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => Coupon::count(),
            'active' => Coupon::where('is_active', true)->count(),
            'total_redemptions' => (int) Coupon::sum('times_used'),
            'fixed_count' => Coupon::where('discount_type', 'fixed')->count(),
            'percentage_count' => Coupon::where('discount_type', 'percentage')->count(),
        ];

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created coupon in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_cap' => ['nullable', 'numeric', 'min:0'],
            'usage_limit_total' => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_user' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['min_order_amount'] = $validated['min_order_amount'] ?? 0.00;
        $validated['usage_limit_per_user'] = $validated['usage_limit_per_user'] ?? 1;
        $validated['is_active'] = $request->boolean('is_active', true);

        Coupon::create($validated);

        return redirect()->route('admin.coupons.index')->with('success', "Coupon '{$validated['code']}' created successfully.");
    }

    /**
     * Update the specified coupon in storage.
     */
    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code,' . $coupon->id],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_cap' => ['nullable', 'numeric', 'min:0'],
            'usage_limit_total' => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_user' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['min_order_amount'] = $validated['min_order_amount'] ?? 0.00;
        $validated['is_active'] = $request->boolean('is_active', true);

        $coupon->update($validated);

        return redirect()->route('admin.coupons.index')->with('success', "Coupon '{$coupon->code}' updated successfully.");
    }

    /**
     * Remove the specified coupon from storage.
     */
    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return redirect()->route('admin.coupons.index')->with('success', "Coupon '{$code}' deleted successfully.");
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => !$coupon->is_active]);

        $status = $coupon->is_active ? 'activated' : 'deactivated';
        return redirect()->back()->with('success', "Coupon '{$coupon->code}' {$status}.");
    }
}
