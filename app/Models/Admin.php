<?php

namespace App\Models;

use Database\Factories\AdminFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    /** @use HasFactory<AdminFactory> */
    use HasFactory, Notifiable;

    /**
     * Allowed admin role constants.
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_INVENTORY_STAFF = 'inventory_staff';

    public const ADMIN_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_ADMIN,
        self::ROLE_MANAGER,
        self::ROLE_INVENTORY_STAFF,
    ];

    /**
     * Granular staff access permission constants.
     */
    public const PERMISSION_MANAGE_PRODUCTS = 'manage_products';
    public const PERMISSION_MANAGE_ORDERS = 'manage_orders';
    public const PERMISSION_MANAGE_INVENTORY = 'manage_inventory';
    public const PERMISSION_MANAGE_PROCUREMENT = 'manage_procurement';
    public const PERMISSION_MANAGE_MARKETING = 'manage_marketing';
    public const PERMISSION_MANAGE_REVIEWS = 'manage_reviews';
    public const PERMISSION_MANAGE_SETTINGS = 'manage_settings';
    public const PERMISSION_MANAGE_STAFF = 'manage_staff';

    /**
     * Full directory of system permissions with UI metadata.
     */
    public const ALL_PERMISSIONS = [
        self::PERMISSION_MANAGE_PRODUCTS => [
            'key' => self::PERMISSION_MANAGE_PRODUCTS,
            'name' => 'Catalog & Products',
            'description' => 'Create, edit, and organize products, categories, brands, and variants.',
            'module' => 'Catalog',
        ],
        self::PERMISSION_MANAGE_ORDERS => [
            'key' => self::PERMISSION_MANAGE_ORDERS,
            'name' => 'Orders & Fulfillment',
            'description' => 'View customer orders, update tracking status, handle cancellations, and invoices.',
            'module' => 'Sales',
        ],
        self::PERMISSION_MANAGE_INVENTORY => [
            'key' => self::PERMISSION_MANAGE_INVENTORY,
            'name' => 'Inventory & Stock Alerts',
            'description' => 'Perform stock adjustments, view inventory movements, and manage low stock thresholds.',
            'module' => 'Logistics',
        ],
        self::PERMISSION_MANAGE_PROCUREMENT => [
            'key' => self::PERMISSION_MANAGE_PROCUREMENT,
            'name' => 'Suppliers & Purchase Orders',
            'description' => 'Manage supplier directories, create purchase orders, and receive batches.',
            'module' => 'Logistics',
        ],
        self::PERMISSION_MANAGE_MARKETING => [
            'key' => self::PERMISSION_MANAGE_MARKETING,
            'name' => 'Marketing & Banners',
            'description' => 'Manage homepage promotional banners, hero slides, and promotional campaigns.',
            'module' => 'Marketing',
        ],
        self::PERMISSION_MANAGE_REVIEWS => [
            'key' => self::PERMISSION_MANAGE_REVIEWS,
            'name' => 'Product Reviews',
            'description' => 'Moderate, approve, reject, or remove customer product reviews and ratings.',
            'module' => 'Catalog',
        ],
        self::PERMISSION_MANAGE_SETTINGS => [
            'key' => self::PERMISSION_MANAGE_SETTINGS,
            'name' => 'Store Settings & Payments',
            'description' => 'Modify store branding, contact information, delivery zones, and payment gateways.',
            'module' => 'Configuration',
        ],
        self::PERMISSION_MANAGE_STAFF => [
            'key' => self::PERMISSION_MANAGE_STAFF,
            'name' => 'Staff & Access Control',
            'description' => 'Add new administrator accounts, assign roles, and configure granular permissions.',
            'module' => 'Administration',
        ],
    ];

    /**
     * Default permission presets by role.
     */
    public static function getDefaultPermissionsForRole(string $role): array
    {
        return match ($role) {
            self::ROLE_SUPER_ADMIN => array_keys(self::ALL_PERMISSIONS),
            self::ROLE_ADMIN => [
                self::PERMISSION_MANAGE_PRODUCTS,
                self::PERMISSION_MANAGE_ORDERS,
                self::PERMISSION_MANAGE_INVENTORY,
                self::PERMISSION_MANAGE_PROCUREMENT,
                self::PERMISSION_MANAGE_MARKETING,
                self::PERMISSION_MANAGE_REVIEWS,
                self::PERMISSION_MANAGE_SETTINGS,
            ],
            self::ROLE_MANAGER => [
                self::PERMISSION_MANAGE_PRODUCTS,
                self::PERMISSION_MANAGE_ORDERS,
                self::PERMISSION_MANAGE_INVENTORY,
                self::PERMISSION_MANAGE_REVIEWS,
            ],
            self::ROLE_INVENTORY_STAFF => [
                self::PERMISSION_MANAGE_PRODUCTS,
                self::PERMISSION_MANAGE_INVENTORY,
                self::PERMISSION_MANAGE_PROCUREMENT,
            ],
            default => [],
        };
    }

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admins';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'avatar',
        'is_active',
        'password',
        'permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'permissions' => 'array',
        ];
    }

    /**
     * Determine if the admin has administrative privileges.
     */
    public function hasAdminAccess(): bool
    {
        return $this->is_active && in_array($this->role, self::ADMIN_ROLES, true);
    }

    /**
     * Check if administrator has a specific permission.
     * Super admins unconditionally possess all permissions.
     */
    public function hasPermission(string $permission): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->isSuperAdmin()) {
            return true;
        }

        $perms = $this->permissions ?? [];
        return in_array($permission, $perms, true);
    }

    /**
     * Check if administrator has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->isSuperAdmin()) {
            return true;
        }

        $perms = $this->permissions ?? [];
        foreach ($permissions as $permission) {
            if (in_array($permission, $perms, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if administrator has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->isSuperAdmin()) {
            return true;
        }

        $perms = $this->permissions ?? [];
        foreach ($permissions as $permission) {
            if (! in_array($permission, $perms, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Role inspection helper methods.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, self::ADMIN_ROLES, true);
    }

    /**
     * Query scopes for filtering administrators.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeRole(Builder $query, string $role): Builder
    {
        return $query->where('role', $role);
    }

    public function scopeStaff(Builder $query): Builder
    {
        return $query->whereIn('role', self::ADMIN_ROLES);
    }
}
