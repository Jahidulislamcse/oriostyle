import React, { useState, useMemo } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import Pagination from '@/Components/Common/Pagination';
import {
    Shield,
    ShieldCheck,
    UserCheck,
    UserX,
    Users,
    Plus,
    Edit3,
    Trash2,
    Search,
    Lock,
    Mail,
    Phone,
    User,
    Key,
    Check,
    CheckCircle2,
    AlertCircle,
    Info,
    RotateCcw
} from 'lucide-react';

export default function StaffIndex({
    admins = { data: [], links: [] },
    filters = {},
    stats = {},
    availableRoles = [],
    availablePermissions = [],
    defaultRolePermissions = {},
}) {
    const { auth = {} } = usePage().props;
    const currentAdminUser = auth?.user;

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deletingStaff, setDeletingStaff] = useState(null);
    const [toggleLoadingId, setToggleLoadingId] = useState(null);

    // Create / Edit Form
    const {
        data: formData,
        setData: setFormData,
        post: submitCreate,
        put: submitUpdate,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm,
        clearErrors: clearFormErrors,
    } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'admin',
        password: '',
        password_confirmation: '',
        is_active: true,
        permissions: defaultRolePermissions?.admin || [],
    });

    // Handle filter submit
    const applyFilters = (newFilters = {}) => {
        router.get(
            route('admin.staff.index'),
            {
                search: searchQuery,
                role: roleFilter,
                status: statusFilter,
                ...newFilters,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setRoleFilter('');
        setStatusFilter('');
        router.get(route('admin.staff.index'));
    };

    // Open Create Modal
    const openCreateModal = () => {
        clearFormErrors();
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'admin',
            password: '',
            password_confirmation: '',
            is_active: true,
            permissions: defaultRolePermissions?.admin || [],
        });
        setIsCreateModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (staff) => {
        clearFormErrors();
        setEditingStaff(staff);
        setFormData({
            name: staff.name || '',
            email: staff.email || '',
            phone: staff.phone || '',
            role: staff.role || 'admin',
            password: '',
            password_confirmation: '',
            is_active: Boolean(staff.is_active),
            permissions: Array.isArray(staff.permissions)
                ? staff.permissions
                : (defaultRolePermissions?.[staff.role] || []),
        });
        setIsEditModalOpen(true);
    };

    // Handle Role Change inside Modal
    const handleRoleChange = (newRole) => {
        const defaultPerms = defaultRolePermissions?.[newRole] || [];
        setFormData((prev) => ({
            ...prev,
            role: newRole,
            permissions: newRole === 'super_admin' 
                ? availablePermissions.map((p) => p.key)
                : defaultPerms,
        }));
    };

    // Toggle Permission Checkbox
    const togglePermission = (permKey) => {
        if (formData.role === 'super_admin') return;

        setFormData((prev) => {
            const current = prev.permissions || [];
            const updated = current.includes(permKey)
                ? current.filter((k) => k !== permKey)
                : [...current, permKey];
            return { ...prev, permissions: updated };
        });
    };

    // Quick Select All / Clear All Permissions
    const selectAllPermissions = () => {
        setFormData((prev) => ({
            ...prev,
            permissions: availablePermissions.map((p) => p.key),
        }));
    };

    const resetToRoleDefaultPermissions = () => {
        setFormData((prev) => ({
            ...prev,
            permissions: defaultRolePermissions?.[prev.role] || [],
        }));
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        submitCreate(route('admin.staff.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
        });
    };

    // Submit Edit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingStaff) return;
        submitUpdate(route('admin.staff.update', editingStaff.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingStaff(null);
                resetForm();
            },
        });
    };

    // Quick Status Toggle
    const handleToggleActive = (staff) => {
        if (staff.id === currentAdminUser?.id) return;
        setToggleLoadingId(staff.id);
        router.patch(
            route('admin.staff.toggle-active', staff.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setToggleLoadingId(null),
            }
        );
    };

    // Delete Staff Action
    const confirmDeleteStaff = () => {
        if (!deletingStaff) return;
        router.delete(route('admin.staff.destroy', deletingStaff.id), {
            onSuccess: () => setDeletingStaff(null),
            onFinish: () => setDeletingStaff(null),
        });
    };

    // Role badge renderer
    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        Super Admin
                    </span>
                );
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        Store Admin
                    </span>
                );
            case 'manager':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        Store Manager
                    </span>
                );
            case 'inventory_staff':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/30">
                        <Users className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        Inventory Staff
                    </span>
                );
            default:
                return (
                    <Badge variant="neutral" size="sm">
                        {role}
                    </Badge>
                );
        }
    };

    // Group available permissions by module
    const groupedPermissions = useMemo(() => {
        const groups = {};
        availablePermissions.forEach((perm) => {
            const mod = perm.module || 'General';
            if (!groups[mod]) groups[mod] = [];
            groups[mod].push(perm);
        });
        return groups;
    }, [availablePermissions]);

    return (
        <AdminLayout title="Staff & Access Control">
            <Head title="Staff & Access Control - Administration" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0E2038] p-6 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-[#D4AF37]/15 text-[#926F18] dark:text-[#EBD495] border border-[#D4AF37]/30">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                                    Staff & Access Control
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                    Create executive administrator accounts, assign roles, and grant fine-grained module access.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 shadow-md shadow-[#D4AF37]/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Staff Member</span>
                    </Button>
                </div>

                {/* Metrics Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#0E2038] p-4.5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8EB0CF]">
                                Total Administrators
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#071324] flex items-center justify-center text-slate-700 dark:text-slate-300">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[#0E2038] dark:text-white">
                            {stats?.total ?? 0}
                        </p>
                        <span className="text-xs text-slate-400 dark:text-[#5E8CB6]">
                            {stats?.active ?? 0} active &middot; {stats?.inactive ?? 0} inactive
                        </span>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] p-4.5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                Super Admins
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[#0E2038] dark:text-white">
                            {stats?.super_admin ?? 0}
                        </p>
                        <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
                            Unrestricted root sovereignty
                        </span>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] p-4.5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                                Store Admins
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[#0E2038] dark:text-white">
                            {stats?.admin ?? 0}
                        </p>
                        <span className="text-xs text-blue-600/80 dark:text-blue-400/80">
                            Full operational management
                        </span>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] p-4.5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                                Managers & Inventory
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <UserCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[#0E2038] dark:text-white">
                            {(stats?.manager ?? 0) + (stats?.inventory_staff ?? 0)}
                        </p>
                        <span className="text-xs text-teal-600/80 dark:text-teal-400/80">
                            {stats?.manager ?? 0} managers &middot; {stats?.inventory_staff ?? 0} stock staff
                        </span>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-[#0E2038] p-4.5 rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#5E8CB6]" />
                            <input
                                type="text"
                                placeholder="Search staff by name, email address, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-sm text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                applyFilters({ role: e.target.value });
                            }}
                            className="px-3 py-2 bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-sm text-[#0E2038] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                        >
                            <option value="">All Roles</option>
                            <option value="super_admin">Super Administrator</option>
                            <option value="admin">Store Administrator</option>
                            <option value="manager">Store Manager</option>
                            <option value="inventory_staff">Inventory Staff</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="px-3 py-2 bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-sm text-[#0E2038] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active Accounts</option>
                            <option value="inactive">Suspended Accounts</option>
                        </select>

                        <Button type="submit" variant="secondary" size="md">
                            Search
                        </Button>

                        {(searchQuery || roleFilter || statusFilter) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="md"
                                onClick={handleResetFilters}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Reset
                            </Button>
                        )}
                    </form>
                </div>

                {/* Staff Members Table */}
                <div className="bg-white dark:bg-[#0E2038] rounded-2xl border border-slate-200 dark:border-[#1C3E63]/70 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-[#071324]/60 border-b border-slate-200 dark:border-[#1C3E63]/70 text-slate-500 dark:text-[#8EB0CF] uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">Administrator / Staff</th>
                                    <th className="py-3.5 px-4 font-bold">Role Assignment</th>
                                    <th className="py-3.5 px-4 font-bold">Module Access Permissions</th>
                                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/40">
                                {admins?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-[#5E8CB6]">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="w-8 h-8 opacity-40" />
                                                <p className="font-semibold">No administrator accounts found</p>
                                                <p className="text-xs">Try clearing search filters or add a new staff member.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    admins?.data?.map((staff) => {
                                        const isSelf = staff.id === currentAdminUser?.id;
                                        const isSuper = staff.role === 'super_admin';
                                        const permsList = staff.permissions || [];

                                        return (
                                            <tr
                                                key={staff.id}
                                                className="hover:bg-slate-50/70 dark:hover:bg-[#0c1f38]/50 transition duration-150"
                                            >
                                                {/* Staff details */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#1C3E63] dark:to-[#0c1f38] border border-slate-200 dark:border-[#1C3E63] flex items-center justify-center font-black text-sm text-[#0E2038] dark:text-[#EBD495] shrink-0">
                                                            {staff.name?.slice(0, 2).toUpperCase() || 'AD'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-[#0E2038] dark:text-white truncate">
                                                                    {staff.name}
                                                                </span>
                                                                {isSelf && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#D4AF37]/20 text-[#926F18] dark:text-[#EBD495] border border-[#D4AF37]/40">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#8EB0CF] mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-3 h-3 text-slate-400 dark:text-[#5E8CB6]" />
                                                                    {staff.email}
                                                                </span>
                                                                {staff.phone && (
                                                                    <span className="hidden sm:flex items-center gap-1">
                                                                        <Phone className="w-3 h-3 text-slate-400 dark:text-[#5E8CB6]" />
                                                                        {staff.phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="py-3.5 px-4">
                                                    {getRoleBadge(staff.role)}
                                                </td>

                                                {/* Permissions Preview */}
                                                <td className="py-3.5 px-4">
                                                    {isSuper ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                                            <Shield className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                                            <span>Full Sovereign Access (All Modules)</span>
                                                        </div>
                                                    ) : permsList.length > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
                                                            {permsList.slice(0, 3).map((perm) => {
                                                                const meta = availablePermissions.find((p) => p.key === perm);
                                                                return (
                                                                    <span
                                                                        key={perm}
                                                                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#071324] text-slate-700 dark:text-[#BACDE3] border border-slate-200 dark:border-[#1C3E63]"
                                                                    >
                                                                        {meta?.name || perm}
                                                                    </span>
                                                                );
                                                            })}
                                                            {permsList.length > 3 && (
                                                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-[#1C3E63] text-slate-700 dark:text-slate-200">
                                                                    +{permsList.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                                                            No granular permissions assigned
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status Toggle */}
                                                <td className="py-3.5 px-4 text-center">
                                                    {isSelf ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleActive(staff)}
                                                            disabled={toggleLoadingId === staff.id}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                                                                staff.is_active
                                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800'
                                                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-800'
                                                            }`}
                                                            title="Click to toggle account activation"
                                                        >
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${
                                                                    staff.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                                                                }`}
                                                            />
                                                            {staff.is_active ? 'Active' : 'Suspended'}
                                                        </button>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(staff)}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:text-[#8EB0CF] dark:hover:text-[#EBD495] dark:hover:bg-[#1C3E63]/60 transition"
                                                            title="Edit Details & Access Permissions"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>

                                                        {!isSelf && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingStaff(staff)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 transition"
                                                                title="Delete Staff Member"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {admins?.links && admins.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                            <Pagination links={admins.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Staff Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Staff Member"
                description="Add an administrator or staff member, assign their role, and specify custom module permissions."
                maxWidth="2xl"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={formProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateSubmit}
                            processing={formProcessing}
                        >
                            Create Administrator
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleCreateSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Full Name"
                            required
                            placeholder="e.g. Jahid Hasan"
                            value={formData.name}
                            onChange={(e) => setFormData('name', e.target.value)}
                            error={formErrors.name}
                        />

                        <FormInput
                            label="Email Address"
                            type="email"
                            required
                            placeholder="jahid@oriostyle.com"
                            value={formData.email}
                            onChange={(e) => setFormData('email', e.target.value)}
                            error={formErrors.email}
                        />

                        <FormInput
                            label="Phone Number"
                            placeholder="+880 1700 000000"
                            value={formData.phone}
                            onChange={(e) => setFormData('phone', e.target.value)}
                            error={formErrors.phone}
                        />

                        <FormSelect
                            label="Role Assignment"
                            required
                            value={formData.role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            error={formErrors.role}
                            options={availableRoles.map((r) => ({
                                value: r.value,
                                label: r.label,
                            }))}
                        />
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-[#1C3E63]/50">
                        <FormInput
                            label="Account Password"
                            type="password"
                            required
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={(e) => setFormData('password', e.target.value)}
                            error={formErrors.password}
                        />

                        <FormInput
                            label="Confirm Password"
                            type="password"
                            required
                            placeholder="Re-type password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData('password_confirmation', e.target.value)}
                            error={formErrors.password_confirmation}
                        />
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData('is_active', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 dark:border-[#1C3E63] text-[#D4AF37] focus:ring-[#D4AF37]/40"
                            />
                            <span className="text-sm font-semibold text-[#0E2038] dark:text-white">
                                Activate account immediately
                            </span>
                        </label>
                    </div>

                    {/* Permissions Section */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#1C3E63]/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2038] dark:text-white">
                                    Module Access Permissions
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                    Control which sections of the admin portal this user can manage.
                                </p>
                            </div>

                            {formData.role !== 'super_admin' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllPermissions}
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-600">&middot;</span>
                                    <button
                                        type="button"
                                        onClick={resetToRoleDefaultPermissions}
                                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                                    >
                                        Reset to Role Preset
                                    </button>
                                </div>
                            )}
                        </div>

                        {formData.role === 'super_admin' ? (
                            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                                <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>
                                    Super Administrators possess unrestricted sovereign authority across all catalog, orders, logistics, marketing, and configuration modules automatically.
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                                {availablePermissions.map((perm) => {
                                    const isChecked = formData.permissions?.includes(perm.key);
                                    return (
                                        <div
                                            key={perm.key}
                                            onClick={() => togglePermission(perm.key)}
                                            className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                                                isChecked
                                                    ? 'bg-amber-500/5 dark:bg-[#D4AF37]/10 border-[#D4AF37]/50'
                                                    : 'bg-slate-50 dark:bg-[#071324] border-slate-200 dark:border-[#1C3E63]/70 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-[#1C3E63] text-[#D4AF37] focus:ring-[#D4AF37]/40 pointer-events-none"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-[#0E2038] dark:text-white">
                                                    {perm.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-[#8EB0CF] line-clamp-2 mt-0.5">
                                                    {perm.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {formErrors.permissions && (
                            <p className="text-xs text-rose-500 font-medium">{formErrors.permissions}</p>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingStaff(null);
                }}
                title={`Edit Staff: ${editingStaff?.name || ''}`}
                description="Modify profile information, role assignment, password, and module access permissions."
                maxWidth="2xl"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditingStaff(null);
                            }}
                            disabled={formProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleEditSubmit}
                            processing={formProcessing}
                        >
                            Save Changes
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleEditSubmit} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Full Name"
                            required
                            placeholder="e.g. Jahid Hasan"
                            value={formData.name}
                            onChange={(e) => setFormData('name', e.target.value)}
                            error={formErrors.name}
                        />

                        <FormInput
                            label="Email Address"
                            type="email"
                            required
                            placeholder="jahid@oriostyle.com"
                            value={formData.email}
                            onChange={(e) => setFormData('email', e.target.value)}
                            error={formErrors.email}
                        />

                        <FormInput
                            label="Phone Number"
                            placeholder="+880 1700 000000"
                            value={formData.phone}
                            onChange={(e) => setFormData('phone', e.target.value)}
                            error={formErrors.phone}
                        />

                        <FormSelect
                            label="Role Assignment"
                            required
                            value={formData.role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            error={formErrors.role}
                            disabled={editingStaff?.id === currentAdminUser?.id}
                            options={availableRoles.map((r) => ({
                                value: r.value,
                                label: r.label,
                            }))}
                        />
                    </div>

                    {editingStaff?.id === currentAdminUser?.id && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            Note: You cannot demote your own Super Administrator role.
                        </p>
                    )}

                    {/* Change Password (Optional) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#1C3E63]/50 space-y-3">
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-slate-400 dark:text-[#5E8CB6]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#BACDE3]">
                                Reset Password (Optional)
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                            Leave both fields blank to retain the administrator's existing password.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                label="New Password"
                                type="password"
                                placeholder="Leave blank to keep existing"
                                value={formData.password}
                                onChange={(e) => setFormData('password', e.target.value)}
                                error={formErrors.password}
                            />

                            <FormInput
                                label="Confirm New Password"
                                type="password"
                                placeholder="Re-type new password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData('password_confirmation', e.target.value)}
                                error={formErrors.password_confirmation}
                            />
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-[#1C3E63]/50">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData('is_active', e.target.checked)}
                                disabled={editingStaff?.id === currentAdminUser?.id}
                                className="w-4 h-4 rounded border-slate-300 dark:border-[#1C3E63] text-[#D4AF37] focus:ring-[#D4AF37]/40"
                            />
                            <span className="text-sm font-semibold text-[#0E2038] dark:text-white">
                                Account is Active & Enabled
                            </span>
                        </label>
                    </div>

                    {/* Permissions Section */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#1C3E63]/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2038] dark:text-white">
                                    Module Access Permissions
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                    Control which sections of the admin portal this user can manage.
                                </p>
                            </div>

                            {formData.role !== 'super_admin' && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllPermissions}
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-600">&middot;</span>
                                    <button
                                        type="button"
                                        onClick={resetToRoleDefaultPermissions}
                                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                                    >
                                        Reset to Role Preset
                                    </button>
                                </div>
                            )}
                        </div>

                        {formData.role === 'super_admin' ? (
                            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                                <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>
                                    Super Administrators possess unrestricted sovereign authority across all catalog, orders, logistics, marketing, and configuration modules automatically.
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                                {availablePermissions.map((perm) => {
                                    const isChecked = formData.permissions?.includes(perm.key);
                                    return (
                                        <div
                                            key={perm.key}
                                            onClick={() => togglePermission(perm.key)}
                                            className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                                                isChecked
                                                    ? 'bg-amber-500/5 dark:bg-[#D4AF37]/10 border-[#D4AF37]/50'
                                                    : 'bg-slate-50 dark:bg-[#071324] border-slate-200 dark:border-[#1C3E63]/70 hover:border-slate-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-[#1C3E63] text-[#D4AF37] focus:ring-[#D4AF37]/40 pointer-events-none"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-[#0E2038] dark:text-white">
                                                    {perm.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-[#8EB0CF] line-clamp-2 mt-0.5">
                                                    {perm.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {formErrors.permissions && (
                            <p className="text-xs text-rose-500 font-medium">{formErrors.permissions}</p>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletingStaff)}
                onClose={() => setDeletingStaff(null)}
                onConfirm={confirmDeleteStaff}
                title="Remove Administrator Account"
                message={`Are you sure you want to permanently delete the administrator account for "${deletingStaff?.name}" (${deletingStaff?.email})? This staff member will immediately lose access to the administrative dashboard.`}
                confirmText="Yes, Delete Account"
                cancelText="Cancel"
                variant="danger"
            />
        </AdminLayout>
    );
}
