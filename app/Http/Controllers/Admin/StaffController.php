<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StaffRequest;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display a paginated listing of staff and administrators.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $role = $request->input('role');
        $status = $request->input('status');

        $query = Admin::query()->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role && in_array($role, Admin::ADMIN_ROLES, true)) {
            $query->where('role', $role);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $admins = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => Admin::count(),
            'super_admin' => Admin::where('role', Admin::ROLE_SUPER_ADMIN)->count(),
            'admin' => Admin::where('role', Admin::ROLE_ADMIN)->count(),
            'manager' => Admin::where('role', Admin::ROLE_MANAGER)->count(),
            'inventory_staff' => Admin::where('role', Admin::ROLE_INVENTORY_STAFF)->count(),
            'active' => Admin::where('is_active', true)->count(),
            'inactive' => Admin::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/Staff/Index', [
            'admins' => $admins,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
            ],
            'stats' => $stats,
            'availableRoles' => [
                [
                    'value' => Admin::ROLE_SUPER_ADMIN,
                    'label' => 'Super Administrator',
                    'description' => 'Full administrative sovereignty. Manages staff, settings, finance, and operations.',
                ],
                [
                    'value' => Admin::ROLE_ADMIN,
                    'label' => 'Store Administrator',
                    'description' => 'Full operational control over catalog, inventory, procurement, and orders.',
                ],
                [
                    'value' => Admin::ROLE_MANAGER,
                    'label' => 'Store Manager',
                    'description' => 'Supervises sales, order fulfillment, customers, and catalog items.',
                ],
                [
                    'value' => Admin::ROLE_INVENTORY_STAFF,
                    'label' => 'Inventory Staff',
                    'description' => 'Dedicated to stock management, warehouse movements, and supplier goods receipt.',
                ],
            ],
            'availablePermissions' => array_values(Admin::ALL_PERMISSIONS),
            'defaultRolePermissions' => [
                Admin::ROLE_SUPER_ADMIN => Admin::getDefaultPermissionsForRole(Admin::ROLE_SUPER_ADMIN),
                Admin::ROLE_ADMIN => Admin::getDefaultPermissionsForRole(Admin::ROLE_ADMIN),
                Admin::ROLE_MANAGER => Admin::getDefaultPermissionsForRole(Admin::ROLE_MANAGER),
                Admin::ROLE_INVENTORY_STAFF => Admin::getDefaultPermissionsForRole(Admin::ROLE_INVENTORY_STAFF),
            ],
        ]);
    }

    /**
     * Store a newly created administrator / staff member.
     */
    public function store(StaffRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $role = $validated['role'];
        $permissions = $role === Admin::ROLE_SUPER_ADMIN
            ? array_keys(Admin::ALL_PERMISSIONS)
            : ($validated['permissions'] ?? Admin::getDefaultPermissionsForRole($role));

        Admin::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'] ?? null,
            'role' => $role,
            'password' => Hash::make($validated['password']),
            'is_active' => $request->boolean('is_active', true),
            'permissions' => $permissions,
        ]);

        return redirect()->route('admin.staff.index')->with('success', 'Staff account created successfully.');
    }

    /**
     * Update the specified administrator details and permissions.
     */
    public function update(StaffRequest $request, Admin $admin): RedirectResponse
    {
        /** @var Admin|null $currentAdmin */
        $currentAdmin = $request->user('admin') ?? $request->user();
        $validated = $request->validated();

        $newRole = $validated['role'];
        $newActive = $request->boolean('is_active', true);

        // Safety 1: Prevent current user from demoting self or deactivating self
        if ($currentAdmin && $currentAdmin->id === $admin->id) {
            if ($newRole !== Admin::ROLE_SUPER_ADMIN) {
                return redirect()->back()->with('error', 'You cannot remove your own Super Administrator role.');
            }
            if (! $newActive) {
                return redirect()->back()->with('error', 'You cannot deactivate your own active session account.');
            }
        }

        // Safety 2: Ensure at least one active Super Admin remains in the system
        if ($admin->isSuperAdmin() && ($newRole !== Admin::ROLE_SUPER_ADMIN || ! $newActive)) {
            $otherSuperAdminsCount = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('is_active', true)
                ->where('id', '!=', $admin->id)
                ->count();

            if ($otherSuperAdminsCount === 0) {
                return redirect()->back()->with('error', 'Operation blocked: The system must retain at least one active Super Administrator.');
            }
        }

        $permissions = $newRole === Admin::ROLE_SUPER_ADMIN
            ? array_keys(Admin::ALL_PERMISSIONS)
            : ($validated['permissions'] ?? Admin::getDefaultPermissionsForRole($newRole));

        $admin->name = $validated['name'];
        $admin->email = strtolower($validated['email']);
        $admin->phone = $validated['phone'] ?? null;
        $admin->role = $newRole;
        $admin->is_active = $newActive;
        $admin->permissions = $permissions;

        if (! empty($validated['password'])) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        return redirect()->route('admin.staff.index')->with('success', "Staff record for {$admin->name} updated successfully.");
    }

    /**
     * Toggle the active status of an administrator.
     */
    public function toggleActive(Request $request, Admin $admin): RedirectResponse
    {
        /** @var Admin|null $currentAdmin */
        $currentAdmin = $request->user('admin') ?? $request->user();

        if ($currentAdmin && $currentAdmin->id === $admin->id) {
            return redirect()->back()->with('error', 'You cannot deactivate your own administrative account.');
        }

        if ($admin->isSuperAdmin() && $admin->is_active) {
            $otherSuperAdminsCount = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('is_active', true)
                ->where('id', '!=', $admin->id)
                ->count();

            if ($otherSuperAdminsCount === 0) {
                return redirect()->back()->with('error', 'Operation blocked: Cannot deactivate the last remaining active Super Administrator.');
            }
        }

        $admin->is_active = ! $admin->is_active;
        $admin->save();

        $statusLabel = $admin->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Account for {$admin->name} has been {$statusLabel}.");
    }

    /**
     * Remove the specified administrator from the system.
     */
    public function destroy(Request $request, Admin $admin): RedirectResponse
    {
        /** @var Admin|null $currentAdmin */
        $currentAdmin = $request->user('admin') ?? $request->user();

        if ($currentAdmin && $currentAdmin->id === $admin->id) {
            return redirect()->back()->with('error', 'Security rule: You cannot delete your own administrator account.');
        }

        if ($admin->isSuperAdmin()) {
            $otherSuperAdminsCount = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('id', '!=', $admin->id)
                ->count();

            if ($otherSuperAdminsCount === 0) {
                return redirect()->back()->with('error', 'Security rule: Cannot delete the only Super Administrator account.');
            }
        }

        $adminName = $admin->name;
        $admin->delete();

        return redirect()->route('admin.staff.index')->with('success', "Administrator {$adminName} removed successfully.");
    }
}
