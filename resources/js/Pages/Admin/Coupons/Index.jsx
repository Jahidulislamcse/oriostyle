import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import Pagination from '@/Components/Common/Pagination';
import {
    Ticket,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    Search,
    Percent,
    DollarSign,
    Calendar,
    Users,
    TrendingUp
} from 'lucide-react';

export default function CouponIndex({ coupons = { data: [] }, stats = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deletingCoupon, setDeletingCoupon] = useState(null);

    // Form setup for create/edit
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '0',
        max_discount_cap: '',
        usage_limit_total: '',
        usage_limit_per_user: '1',
        start_date: '',
        end_date: '',
        is_active: true,
    });

    const applyFilters = (newSearch = searchQuery, newStatus = statusFilter) => {
        router.get(
            route('admin.coupons.index'),
            { search: newSearch, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(searchQuery, statusFilter);
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setData({
            code: '',
            name: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: '0',
            max_discount_cap: '',
            usage_limit_total: '',
            usage_limit_per_user: '1',
            start_date: '',
            end_date: '',
            is_active: true,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon);
        clearErrors();
        setData({
            code: coupon.code || '',
            name: coupon.name || '',
            description: coupon.description || '',
            discount_type: coupon.discount_type || 'percentage',
            discount_value: coupon.discount_value !== undefined ? String(coupon.discount_value) : '',
            min_order_amount: coupon.min_order_amount !== undefined ? String(coupon.min_order_amount) : '0',
            max_discount_cap: coupon.max_discount_cap !== null && coupon.max_discount_cap !== undefined ? String(coupon.max_discount_cap) : '',
            usage_limit_total: coupon.usage_limit_total !== null && coupon.usage_limit_total !== undefined ? String(coupon.usage_limit_total) : '',
            usage_limit_per_user: coupon.usage_limit_per_user !== undefined ? String(coupon.usage_limit_per_user) : '1',
            start_date: coupon.start_date ? coupon.start_date.substring(0, 10) : '',
            end_date: coupon.end_date ? coupon.end_date.substring(0, 10) : '',
            is_active: Boolean(coupon.is_active),
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('admin.coupons.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingCoupon) return;
        put(route('admin.coupons.update', editingCoupon.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingCoupon(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deletingCoupon) return;
        router.delete(route('admin.coupons.destroy', deletingCoupon.id), {
            onSuccess: () => setDeletingCoupon(null),
        });
    };

    const handleToggleActive = (coupon) => {
        router.patch(route('admin.coupons.toggle-active', coupon.id), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <Head title="Promotional Coupons | Admin" />

            <div className="space-y-6">
                {/* Header Title & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Ticket className="w-7 h-7 text-amber-500" />
                            Promotional Coupons & Discount Rules
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Configure percentage and fixed discount coupons with minimum spends, usage limits, and validity dates.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Coupon
                    </Button>
                </div>

                {/* Metrics Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Coupons</span>
                            <Ticket className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total || 0}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Promo Codes</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.active || 0}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Redemptions</span>
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{stats.total_redemptions || 0}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type Ratio</span>
                            <Percent className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">
                            <span className="font-bold text-gray-900 dark:text-white">{stats.percentage_count || 0}</span> Percentage / <span className="font-bold text-gray-900 dark:text-white">{stats.fixed_count || 0}</span> Fixed
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by code or campaign name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                    </form>

                    <div className="flex items-center gap-3">
                        <FormSelect
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters(searchQuery, e.target.value);
                            }}
                            className="text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </FormSelect>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Code & Campaign</th>
                                    <th className="px-6 py-4">Discount</th>
                                    <th className="px-6 py-4">Min. Spend</th>
                                    <th className="px-6 py-4">Usage Limits</th>
                                    <th className="px-6 py-4">Validity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {coupons.data && coupons.data.length > 0 ? (
                                    coupons.data.map((c) => {
                                        const isExpired = c.end_date && new Date(c.end_date) < new Date();
                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs tracking-wider border border-amber-200 dark:border-amber-800">
                                                            {c.code}
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold text-gray-900 dark:text-white block mt-1">
                                                        {c.name}
                                                    </span>
                                                    {c.description && (
                                                        <span className="text-xs text-gray-400 block line-clamp-1">
                                                            {c.description}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {c.discount_type === 'percentage'
                                                            ? `${Number(c.discount_value)}% OFF`
                                                            : `৳${Number(c.discount_value).toLocaleString()} OFF`}
                                                    </span>
                                                    {c.discount_type === 'percentage' && c.max_discount_cap && (
                                                        <span className="block text-xs text-gray-400">
                                                            Max cap: ৳{Number(c.max_discount_cap).toLocaleString()}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 font-mono font-medium">
                                                    {Number(c.min_order_amount) > 0 ? (
                                                        `৳${Number(c.min_order_amount).toLocaleString()}`
                                                    ) : (
                                                        <span className="text-gray-400">No minimum</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-xs space-y-1">
                                                    <div className="text-gray-900 dark:text-white font-medium">
                                                        {c.times_used} / {c.usage_limit_total ? c.usage_limit_total : '∞'} used
                                                    </div>
                                                    <div className="text-gray-400">
                                                        Limit: {c.usage_limit_per_user || 1}/user
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-xs">
                                                    {c.start_date || c.end_date ? (
                                                        <div className="space-y-0.5">
                                                            {c.start_date && (
                                                                <span className="block text-gray-500">From: {c.start_date.substring(0, 10)}</span>
                                                            )}
                                                            {c.end_date && (
                                                                <span className={`block font-medium ${isExpired ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                    To: {c.end_date.substring(0, 10)} {isExpired && '(Expired)'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Always valid</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(c)}
                                                        className="focus:outline-none"
                                                        title="Toggle active status"
                                                    >
                                                        {c.is_active ? (
                                                            <Badge variant="success">Active</Badge>
                                                        ) : (
                                                            <Badge variant="danger">Inactive</Badge>
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(c)}
                                                            className="p-1.5 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            title="Edit Coupon"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingCoupon(c)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            title="Delete Coupon"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No promotional coupons found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {coupons.links && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <Pagination links={coupons.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Coupon Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Promotional Coupon" maxWidth="2xl">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Coupon Code"
                            placeholder="e.g. SUMMER15"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            error={errors.code}
                            required
                        />

                        <FormInput
                            label="Campaign Name"
                            placeholder="e.g. Summer Grand Sale 15% Off"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                    </div>

                    <FormInput
                        label="Description (Optional)"
                        placeholder="Internal campaign description or customer notice..."
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect
                            label="Discount Type"
                            value={data.discount_type}
                            onChange={(e) => setData('discount_type', e.target.value)}
                            error={errors.discount_type}
                            required
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (৳)</option>
                        </FormSelect>

                        <FormInput
                            label={data.discount_type === 'percentage' ? 'Percentage Value (%)' : 'Fixed Amount (৳)'}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder={data.discount_type === 'percentage' ? '15' : '200'}
                            value={data.discount_value}
                            onChange={(e) => setData('discount_value', e.target.value)}
                            error={errors.discount_value}
                            required
                        />

                        {data.discount_type === 'percentage' ? (
                            <FormInput
                                label="Max Discount Cap (৳)"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 500 (Optional)"
                                value={data.max_discount_cap}
                                onChange={(e) => setData('max_discount_cap', e.target.value)}
                                error={errors.max_discount_cap}
                            />
                        ) : (
                            <FormInput
                                label="Minimum Spend (৳)"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={data.min_order_amount}
                                onChange={(e) => setData('min_order_amount', e.target.value)}
                                error={errors.min_order_amount}
                            />
                        )}
                    </div>

                    {data.discount_type === 'percentage' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Minimum Spend (৳)"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                value={data.min_order_amount}
                                onChange={(e) => setData('min_order_amount', e.target.value)}
                                error={errors.min_order_amount}
                            />
                            <div />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Total Redemptions Limit"
                            type="number"
                            min="1"
                            placeholder="Unlimited if empty"
                            value={data.usage_limit_total}
                            onChange={(e) => setData('usage_limit_total', e.target.value)}
                            error={errors.usage_limit_total}
                        />

                        <FormInput
                            label="Max Usage Per User"
                            type="number"
                            min="1"
                            placeholder="1"
                            value={data.usage_limit_per_user}
                            onChange={(e) => setData('usage_limit_per_user', e.target.value)}
                            error={errors.usage_limit_per_user}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Start Date (Optional)"
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            error={errors.start_date}
                        />

                        <FormInput
                            label="End Date (Optional)"
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            error={errors.end_date}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="create_is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="create_is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active immediately upon creation
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Coupon'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Coupon Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Coupon: ${editingCoupon?.code}`} maxWidth="2xl">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Coupon Code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                            error={errors.code}
                            required
                        />

                        <FormInput
                            label="Campaign Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                    </div>

                    <FormInput
                        label="Description (Optional)"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        error={errors.description}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect
                            label="Discount Type"
                            value={data.discount_type}
                            onChange={(e) => setData('discount_type', e.target.value)}
                            error={errors.discount_type}
                            required
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (৳)</option>
                        </FormSelect>

                        <FormInput
                            label={data.discount_type === 'percentage' ? 'Percentage Value (%)' : 'Fixed Amount (৳)'}
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.discount_value}
                            onChange={(e) => setData('discount_value', e.target.value)}
                            error={errors.discount_value}
                            required
                        />

                        <FormInput
                            label="Max Cap (৳)"
                            type="number"
                            step="0.01"
                            placeholder="Optional"
                            value={data.max_discount_cap}
                            onChange={(e) => setData('max_discount_cap', e.target.value)}
                            error={errors.max_discount_cap}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Minimum Spend (৳)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.min_order_amount}
                            onChange={(e) => setData('min_order_amount', e.target.value)}
                            error={errors.min_order_amount}
                        />

                        <FormInput
                            label="Total Usage Limit"
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            value={data.usage_limit_total}
                            onChange={(e) => setData('usage_limit_total', e.target.value)}
                            error={errors.usage_limit_total}
                        />

                        <FormInput
                            label="Limit Per User"
                            type="number"
                            min="1"
                            value={data.usage_limit_per_user}
                            onChange={(e) => setData('usage_limit_per_user', e.target.value)}
                            error={errors.usage_limit_per_user}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Start Date"
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            error={errors.start_date}
                        />

                        <FormInput
                            label="End Date"
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            error={errors.end_date}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="edit_is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={!!deletingCoupon}
                onClose={() => setDeletingCoupon(null)}
                onConfirm={handleDelete}
                title="Delete Coupon"
                message={`Are you sure you want to permanently delete coupon '${deletingCoupon?.code}'? Existing order records will be preserved.`}
                confirmText="Delete Coupon"
                variant="danger"
            />
        </AdminLayout>
    );
}
