import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import DataTable from '@/Components/Common/DataTable';
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
    MapPin
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

    const columns = [
        {
            key: 'name',
            label: 'Supplier & Entity',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-center font-bold text-gold-400 text-sm flex-shrink-0">
                            {(item.name || 'S').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-100">{item.name || 'N/A'}</div>
                            {item.company_name && (
                                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3 text-gold-400" />
                                    <span>{item.company_name}</span>
                                </div>
                            )}
                            {item.city && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    <span>{item.city}, {item.country || 'Bangladesh'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'contact',
            label: 'Contact Info',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-200 font-mono">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{item.phone || '—'}</span>
                        </div>
                        {item.email && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                <span>{item.email}</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'current_balance',
            label: 'Payable Balance',
            render: (val, row) => {
                const item = row || val || {};
                const payable = Number(item.current_balance || 0);

                return (
                    <div className="font-mono">
                        {payable > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                <ArrowUpRight className="w-3 h-3" />
                                {formatCurrency(payable)}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                {formatCurrency(payable)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className="cursor-pointer focus:outline-none transition-transform active:scale-95"
                        title="Click to toggle active status"
                    >
                        <Badge variant={item.is_active ? 'success' : 'secondary'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </button>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'text-right',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <Link
                            href={route('admin.suppliers.show', item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                            title="View Statement & Ledger"
                        >
                            <FileText className="w-4 h-4" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => openPaymentModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-navy-800 transition-colors"
                            title="Record Payment / Transaction"
                        >
                            <CreditCard className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-navy-800 transition-colors"
                            title="Edit Supplier"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setDeletingSupplier(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                            title="Delete Supplier"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const supplierList = suppliers.data || [];

    return (
        <AdminLayout title="Suppliers Directory & Ledger">
            <Head title="Suppliers Ledger - Procurement & Stock" />

            <div className="space-y-6">
                {/* Header section matching Brands & Products */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                            <Truck className="w-7 h-7 text-gold-400" />
                            Suppliers Directory & Ledger
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage vendor directory, purchase statements, and running payable balances.
                        </p>
                    </div>
                    <Button onClick={openCreateModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
                        Add New Supplier
                    </Button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Total Suppliers</span>
                            <Truck className="w-4 h-4 text-gold-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">
                            {metrics.total_suppliers || 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Outstanding Payable</span>
                            <ArrowUpRight className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
                            {formatCurrency(metrics.total_payable)}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Active Suppliers</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                            {metrics.active_suppliers || 0}
                        </div>
                    </div>

                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">Cleared / Settled</span>
                            <ShieldCheck className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-2xl font-bold text-slate-300 mt-2 font-mono">
                            {metrics.cleared_suppliers || 0}
                        </div>
                    </div>
                </div>

                {/* Filters Toolbar */}
                <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, company, phone, or email..."
                                className="w-full bg-navy-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                            />
                        </div>
                        <Button type="submit" variant="secondary" className="px-4">
                            Filter
                        </Button>
                    </form>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <FormSelect
                            value={balanceFilter}
                            onChange={(e) => {
                                setBalanceFilter(e.target.value);
                                applyFilters(searchQuery, statusFilter, e.target.value);
                            }}
                            className="w-48 text-sm"
                            options={[
                                { label: 'All Balances', value: 'all' },
                                { label: 'Payable Only (> 0)', value: 'payable' },
                                { label: 'Cleared Only (0.00)', value: 'cleared' },
                            ]}
                        />

                        <FormSelect
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters(searchQuery, e.target.value, balanceFilter);
                            }}
                            className="w-36 text-sm"
                            options={[
                                { label: 'All Status', value: 'all' },
                                { label: 'Active Only', value: 'true' },
                                { label: 'Inactive Only', value: 'false' },
                            ]}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={supplierList}
                    searchable={false}
                    emptyMessage="No suppliers found in directory. Click 'Add New Supplier' to onboard your first vendor."
                    pagination={suppliers}
                />
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
                            helpText="Positive amount indicates current payable balance to supplier"
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
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5 block">
                            Office Address
                        </label>
                        <textarea
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData('address', e.target.value)}
                            placeholder="Street, industrial area, plot/building..."
                            className="block w-full py-2 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="create_is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData('is_active', e.target.checked)}
                            className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500"
                        />
                        <label htmlFor="create_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Supplier account is active and eligible for purchase orders
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={formProcessing} variant="primary">
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
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5 block">
                            Office Address
                        </label>
                        <textarea
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData('address', e.target.value)}
                            className="block w-full py-2 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="edit_is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData('is_active', e.target.checked)}
                            className="w-4 h-4 rounded text-gold-500 focus:ring-gold-500"
                        />
                        <label htmlFor="edit_is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Supplier account is active
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={formProcessing} variant="primary">
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
                    <div className="p-3.5 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 block font-bold uppercase">Current Payable Balance</span>
                            <span className="text-lg font-black text-rose-400 font-mono">
                                {formatCurrency(activeSupplier?.current_balance)}
                            </span>
                        </div>
                        <Badge variant="warning">Running Ledger</Badge>
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
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5 block">
                            Notes & Description
                        </label>
                        <textarea
                            rows="2"
                            value={paymentData.notes}
                            onChange={(e) => setPaymentData('notes', e.target.value)}
                            placeholder="Reason or invoice reference details..."
                            className="block w-full py-2 px-3.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                        <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={paymentProcessing} variant="primary">
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
