import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import {
    Truck,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    Search,
    CreditCard,
    FileText,
    Phone,
    Mail,
    Building2,
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    Wallet
} from 'lucide-react';

export default function SupplierIndex({ suppliers = { data: [] }, metrics = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.is_active || 'all');
    const [balanceFilter, setBalanceFilter] = useState(filters.has_balance || 'all');

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeSupplier, setActiveSupplier] = useState(null);
    const [deletingSupplier, setDeletingSupplier] = useState(null);

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
        company_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: 'Bangladesh',
        opening_balance: '0.00',
        is_active: true,
        notes: '',
    });

    // Payment / Ledger Entry Form
    const {
        data: paymentData,
        setData: setPaymentData,
        post: submitPayment,
        processing: paymentProcessing,
        errors: paymentErrors,
        reset: resetPayment,
        clearErrors: clearPaymentErrors,
    } = useForm({
        transaction_type: 'payment',
        amount: '',
        reference_no: '',
        payment_method: 'bank_transfer',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const applyFilters = (newSearch = searchQuery, newStatus = statusFilter, newBalance = balanceFilter) => {
        router.get(
            route('admin.suppliers.index'),
            { search: newSearch, is_active: newStatus, has_balance: newBalance },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const openCreateModal = () => {
        clearFormErrors();
        resetForm();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (supplier) => {
        clearFormErrors();
        setActiveSupplier(supplier);
        setFormData({
            name: supplier.name || '',
            company_name: supplier.company_name || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            city: supplier.city || '',
            country: supplier.country || 'Bangladesh',
            opening_balance: supplier.opening_balance || '0.00',
            is_active: Boolean(supplier.is_active),
            notes: supplier.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const openPaymentModal = (supplier) => {
        clearPaymentErrors();
        resetPayment();
        setActiveSupplier(supplier);
        setIsPaymentModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        submitCreate(route('admin.suppliers.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (!activeSupplier) return;
        submitUpdate(route('admin.suppliers.update', activeSupplier.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setActiveSupplier(null);
                resetForm();
            },
        });
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!activeSupplier) return;
        submitPayment(route('admin.suppliers.record-payment', activeSupplier.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setActiveSupplier(null);
                resetPayment();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingSupplier) return;
        router.delete(route('admin.suppliers.destroy', deletingSupplier.id), {
            onSuccess: () => setDeletingSupplier(null),
        });
    };

    const handleToggleActive = (supplier) => {
        router.patch(route('admin.suppliers.toggle-active', supplier.id), {}, { preserveScroll: true });
    };

    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AdminLayout title="Suppliers Directory & Ledger">
            <Head title="Suppliers Ledger - Procurement & Stock" />

            <div className="space-y-6">
                {/* Header & Main Call to Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#D4AF37]/15 text-[#926F18] dark:text-[#EBD495]">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-[#0E2038] dark:text-white">
                                    Suppliers Directory & Ledger
                                </h1>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Manage vendor partnerships, purchase invoices, and running payable balances.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={openCreateModal}
                        className="bg-[#D4AF37] hover:bg-[#B89628] text-[#071324] font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Supplier
                    </Button>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                                Total Suppliers
                            </span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Truck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-[#0E2038] dark:text-white">
                            {metrics.total_suppliers || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">Registered vendor directory</span>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                                Total Outstanding Payable
                            </span>
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency(metrics.total_payable)}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">Total balance owed to suppliers</span>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                Active Accounts
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {metrics.active_suppliers || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">Operational suppliers</span>
                    </div>

                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Settled / Cleared
                            </span>
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-black text-[#0E2038] dark:text-white">
                            {metrics.cleared_suppliers || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">Zero or settled balance</span>
                    </div>
                </div>

                {/* Filters Strip */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, company, phone, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] text-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <select
                            value={balanceFilter}
                            onChange={(e) => {
                                setBalanceFilter(e.target.value);
                                applyFilters(searchQuery, statusFilter, e.target.value);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] text-slate-800 dark:text-slate-100"
                        >
                            <option value="all">All Balances</option>
                            <option value="payable">Outstanding Payable (&gt; 0)</option>
                            <option value="cleared">Cleared / Settled (0.00)</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters(searchQuery, e.target.value, balanceFilter);
                            }}
                            className="px-3 py-2 text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] text-slate-800 dark:text-slate-100"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive</option>
                        </select>

                        <Button type="submit" variant="secondary" className="px-5">
                            Filter
                        </Button>
                    </form>
                </div>

                {/* Suppliers Table */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-[#071324]/60 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-[#1C3E63]/70">
                                <tr>
                                    <th className="py-3.5 px-4">Supplier & Company</th>
                                    <th className="py-3.5 px-4">Contact Info</th>
                                    <th className="py-3.5 px-4 text-right">Payable Balance</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/40 font-medium">
                                {suppliers.data && suppliers.data.length > 0 ? (
                                    suppliers.data.map((supplier) => {
                                        const payable = Number(supplier.current_balance || 0);

                                        return (
                                            <tr key={supplier.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071324]/30 transition">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/60 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-xs">
                                                            {supplier.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#0E2038] dark:text-white">
                                                                {supplier.name}
                                                            </div>
                                                            {supplier.company_name && (
                                                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                                    <Building2 className="w-3 h-3 text-[#D4AF37]" />
                                                                    {supplier.company_name}
                                                                </div>
                                                            )}
                                                            {supplier.city && (
                                                                <div className="text-[11px] text-slate-400">
                                                                    {supplier.city}, {supplier.country}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {supplier.phone}
                                                        </div>
                                                        {supplier.email && (
                                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                                <Mail className="w-3 h-3 text-slate-400" />
                                                                {supplier.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                                            payable > 0
                                                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        }`}
                                                    >
                                                        {formatCurrency(payable)}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(supplier)}
                                                        className="cursor-pointer focus:outline-hidden"
                                                        title="Click to toggle active status"
                                                    >
                                                        {supplier.is_active ? (
                                                            <Badge variant="success" className="text-xs">Active</Badge>
                                                        ) : (
                                                            <Badge variant="danger" className="text-xs">Inactive</Badge>
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('admin.suppliers.show', supplier.id)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                            title="View Ledger Statement"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => openPaymentModal(supplier)}
                                                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition"
                                                            title="Record Payment / Transaction"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(supplier)}
                                                            className="p-1.5 text-slate-500 hover:text-[#926F18] dark:hover:text-[#EBD495] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
                                                            title="Edit Supplier"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingSupplier(supplier)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                                                            title="Delete Supplier"
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
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            <Truck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                                            <p className="font-semibold">No suppliers found.</p>
                                            <p className="text-xs text-slate-400 mt-1">Get started by creating your first supplier vendor record.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {suppliers.links && suppliers.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Showing {suppliers.from || 0} to {suppliers.to || 0} of {suppliers.total || 0} suppliers
                            </span>
                            <div className="flex gap-1">
                                {suppliers.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg font-bold ${
                                            link.active
                                                ? 'bg-[#D4AF37] text-[#071324]'
                                                : link.url
                                                ? 'bg-slate-100 dark:bg-[#071324] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                                : 'text-slate-400 opacity-50 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Supplier Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Supplier"
                maxWidth="md"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <FormInput
                        label="Supplier Contact Person / Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData('name', e.target.value)}
                        error={formErrors.name}
                        placeholder="e.g. Rafiqul Islam"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Company / Enterprise Name"
                            value={formData.company_name}
                            onChange={(e) => setFormData('company_name', e.target.value)}
                            error={formErrors.company_name}
                            placeholder="e.g. TexStyle Fabrics Ltd."
                        />

                        <FormInput
                            label="Phone Number"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData('phone', e.target.value)}
                            error={formErrors.phone}
                            placeholder="e.g. +880 1712 345678"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData('email', e.target.value)}
                            error={formErrors.email}
                            placeholder="vendor@company.com"
                        />

                        <FormInput
                            label="Initial Opening Balance (৳)"
                            type="number"
                            step="0.01"
                            value={formData.opening_balance}
                            onChange={(e) => setFormData('opening_balance', e.target.value)}
                            error={formErrors.opening_balance}
                            helperText="Positive amount indicates current payable balance to supplier"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="City"
                            value={formData.city}
                            onChange={(e) => setFormData('city', e.target.value)}
                            error={formErrors.city}
                            placeholder="Dhaka, Chittagong, etc."
                        />

                        <FormInput
                            label="Country"
                            value={formData.country}
                            onChange={(e) => setFormData('country', e.target.value)}
                            error={formErrors.country}
                            placeholder="Bangladesh"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Office Address
                        </label>
                        <textarea
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData('address', e.target.value)}
                            placeholder="Street, industrial area, plot/building..."
                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="create_is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData('is_active', e.target.checked)}
                            className="w-4 h-4 rounded-sm text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <label htmlFor="create_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Supplier account is active and eligible for purchase orders
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={formProcessing} className="bg-[#D4AF37] text-[#071324] font-bold">
                            Save Supplier
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Supplier Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Supplier: ${activeSupplier?.name || ''}`}
                maxWidth="md"
            >
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <FormInput
                        label="Supplier Contact Person / Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData('name', e.target.value)}
                        error={formErrors.name}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Company / Enterprise Name"
                            value={formData.company_name}
                            onChange={(e) => setFormData('company_name', e.target.value)}
                            error={formErrors.company_name}
                        />

                        <FormInput
                            label="Phone Number"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData('phone', e.target.value)}
                            error={formErrors.phone}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData('email', e.target.value)}
                            error={formErrors.email}
                        />

                        <FormInput
                            label="City"
                            value={formData.city}
                            onChange={(e) => setFormData('city', e.target.value)}
                            error={formErrors.city}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Office Address
                        </label>
                        <textarea
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData('address', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="edit_is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData('is_active', e.target.checked)}
                            className="w-4 h-4 rounded-sm text-[#D4AF37] focus:ring-[#D4AF37]"
                        />
                        <label htmlFor="edit_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Supplier account is active
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={formProcessing} className="bg-[#D4AF37] text-[#071324] font-bold">
                            Update Details
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Record Payment / Ledger Transaction Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={`Record Transaction: ${activeSupplier?.name || ''}`}
                maxWidth="md"
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 block font-bold uppercase">Current Payable Balance</span>
                            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                                {formatCurrency(activeSupplier?.current_balance)}
                            </span>
                        </div>
                        <Badge variant="secondary">Running Ledger</Badge>
                    </div>

                    <FormSelect
                        label="Transaction Type"
                        required
                        value={paymentData.transaction_type}
                        onChange={(e) => setPaymentData('transaction_type', e.target.value)}
                        error={paymentErrors.transaction_type}
                        options={[
                            { value: 'payment', label: 'Payment to Supplier (Reduces Payable)' },
                            { value: 'bill', label: 'Manual Bill / Purchase Invoice (Increases Payable)' },
                            { value: 'return', label: 'Purchase Return Credit (Reduces Payable)' },
                            { value: 'adjustment', label: 'Ledger Adjustment' },
                        ]}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Transaction Amount (৳)"
                            type="number"
                            step="0.01"
                            required
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData('amount', e.target.value)}
                            error={paymentErrors.amount}
                            placeholder="e.g. 25000.00"
                        />

                        <FormSelect
                            label="Payment Method"
                            value={paymentData.payment_method}
                            onChange={(e) => setPaymentData('payment_method', e.target.value)}
                            options={[
                                { value: 'bank_transfer', label: 'Bank Transfer' },
                                { value: 'cash', label: 'Cash Payment' },
                                { value: 'cheque', label: 'Bank Cheque' },
                                { value: 'bkash', label: 'bKash Merchant' },
                                { value: 'nagad', label: 'Nagad Business' },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            label="Reference / Check / TrxID #"
                            value={paymentData.reference_no}
                            onChange={(e) => setPaymentData('reference_no', e.target.value)}
                            error={paymentErrors.reference_no}
                            placeholder="e.g. CHQ-98124 or TRX-771"
                        />

                        <FormInput
                            label="Transaction Date"
                            type="date"
                            required
                            value={paymentData.transaction_date}
                            onChange={(e) => setPaymentData('transaction_date', e.target.value)}
                            error={paymentErrors.transaction_date}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Notes & Description
                        </label>
                        <textarea
                            rows="2"
                            value={paymentData.notes}
                            onChange={(e) => setPaymentData('notes', e.target.value)}
                            placeholder="Reason or invoice reference details..."
                            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37] text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                        <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={paymentProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                            Post to Ledger
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={Boolean(deletingSupplier)}
                onClose={() => setDeletingSupplier(null)}
                onConfirm={handleDelete}
                title="Delete Supplier Record"
                message={`Are you sure you want to delete ${deletingSupplier?.name}? This action cannot be undone.`}
                confirmText="Delete Supplier"
                variant="danger"
            />
        </AdminLayout>
    );
}
