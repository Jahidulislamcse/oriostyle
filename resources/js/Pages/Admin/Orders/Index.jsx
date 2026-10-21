import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import Pagination from '@/Components/Common/Pagination';
import {
    ShoppingBag,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    Truck,
    PackageCheck,
    XCircle,
    RotateCcw,
    DollarSign,
    Eye,
    Printer,
    Phone,
    MapPin,
    Calendar,
    ChevronRight,
    CreditCard,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';

export default function OrderIndex({
    orders = { data: [] },
    metrics = {},
    filters = {},
    orderStatuses = {},
    paymentStatuses = {},
    paymentMethods = {},
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters.payment_status || 'all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(filters.payment_method || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Quick status update modal state
    const [statusModalOrder, setStatusModalOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Quick payment update modal state
    const [paymentModalOrder, setPaymentModalOrder] = useState(null);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

    const applyFilters = (overrides = {}) => {
        const query = {
            search: overrides.search !== undefined ? overrides.search : searchQuery,
            status: overrides.status !== undefined ? overrides.status : statusFilter,
            payment_status: overrides.payment_status !== undefined ? overrides.payment_status : paymentStatusFilter,
            payment_method: overrides.payment_method !== undefined ? overrides.payment_method : paymentMethodFilter,
            date_from: overrides.date_from !== undefined ? overrides.date_from : dateFrom,
            date_to: overrides.date_to !== undefined ? overrides.date_to : dateTo,
        };

        // Remove empty keys
        Object.keys(query).forEach((k) => {
            if (!query[k] || query[k] === 'all') delete query[k];
        });

        router.get(route('admin.orders.index'), query, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPaymentStatusFilter('all');
        setPaymentMethodFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.orders.index'), {}, { preserveState: true, replace: true });
    };

    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Truck className="w-3.5 h-3.5" /> Processing
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Truck className="w-3.5 h-3.5" /> Shipped
                    </span>
                );
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <PackageCheck className="w-3.5 h-3.5" /> Delivered
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                    </span>
                );
            case 'returned':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        <RotateCcw className="w-3.5 h-3.5" /> Returned
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        {status}
                    </span>
                );
        }
    };

    const getPaymentStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        PAID
                    </span>
                );
            case 'unpaid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        UNPAID
                    </span>
                );
            case 'partially_paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PARTIAL
                    </span>
                );
            case 'refunded':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        REFUNDED
                    </span>
                );
            default:
                return <span>{status}</span>;
        }
    };

    const openStatusModal = (order) => {
        setStatusModalOrder(order);
        setSelectedStatus(order.order_status);
        setStatusNotes(order.admin_notes || '');
    };

    const handleSaveStatus = (e) => {
        e.preventDefault();
        if (!statusModalOrder || !selectedStatus) return;

        setIsUpdatingStatus(true);
        router.patch(
            route('admin.orders.status', statusModalOrder.id),
            {
                order_status: selectedStatus,
                admin_notes: statusNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStatusModalOrder(null);
                    setIsUpdatingStatus(false);
                },
                onError: () => setIsUpdatingStatus(false),
            }
        );
    };

    const openPaymentModal = (order) => {
        setPaymentModalOrder(order);
        setSelectedPaymentStatus(order.payment_status);
        setPaymentNotes(order.admin_notes || '');
    };

    const handleSavePayment = (e) => {
        e.preventDefault();
        if (!paymentModalOrder || !selectedPaymentStatus) return;

        setIsUpdatingPayment(true);
        router.patch(
            route('admin.orders.payment', paymentModalOrder.id),
            {
                payment_status: selectedPaymentStatus,
                admin_notes: paymentNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPaymentModalOrder(null);
                    setIsUpdatingPayment(false);
                },
                onError: () => setIsUpdatingPayment(false),
            }
        );
    };

    return (
        <AdminLayout title="Orders & Fulfillment">
            <Head title="Orders Management | ORIO Admin" />

            <div className="space-y-6">
                {/* --- Header & Title --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-[#0E2038] dark:text-white uppercase">
                                Orders Management
                            </h1>
                            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#D4AF37]/15 text-[#926F18] dark:text-[#EBD495] border border-[#D4AF37]/30">
                                Live Pipeline
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Track client purchases, manage parcel fulfillment status, and generate commercial invoices.
                        </p>
                    </div>
                </div>

                {/* --- Metrics Overview Cards --- */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Total Orders */}
                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Total Orders
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-[#0E2038] dark:text-white">
                                {metrics.total_orders ?? 0}
                            </span>
                            <span className="text-xs text-slate-400">lifetime</span>
                        </div>
                    </div>

                    {/* Pending Action */}
                    <div className="bg-white dark:bg-[#0E2038] border border-amber-500/20 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                Pending Action
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-500">
                                {metrics.pending_orders ?? 0}
                            </span>
                            <span className="text-xs text-amber-500/70">needs confirmation</span>
                        </div>
                    </div>

                    {/* Processing / In Transit */}
                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                In Fulfillment
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                <Truck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-indigo-400">
                                {metrics.processing_orders ?? 0}
                            </span>
                            <span className="text-xs text-slate-400">active parcels</span>
                        </div>
                    </div>

                    {/* Delivered */}
                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Delivered
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <PackageCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-400">
                                {metrics.delivered_orders ?? 0}
                            </span>
                            <span className="text-xs text-slate-400">completed</span>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#0E2038] to-[#1C3E63] border border-[#D4AF37]/30 rounded-2xl p-4 shadow-xs text-white">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#EBD495] uppercase tracking-wider">
                                Paid Revenue
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-xl font-black text-white">
                                {formatCurrency(metrics.total_revenue)}
                            </span>
                            <div className="text-[11px] text-slate-300 mt-0.5">
                                Today: {formatCurrency(metrics.today_revenue)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Search & Filter Bar --- */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs space-y-4">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        {/* Search Input */}
                        <div className="sm:col-span-2 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by Order #, Name, Phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            />
                        </div>

                        {/* Order Status */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            >
                                <option value="all">All Statuses</option>
                                {Object.entries(orderStatuses).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div>
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => {
                                    setPaymentStatusFilter(e.target.value);
                                    applyFilters({ payment_status: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            >
                                <option value="all">All Payments</option>
                                {Object.entries(paymentStatuses).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <select
                                value={paymentMethodFilter}
                                onChange={(e) => {
                                    setPaymentMethodFilter(e.target.value);
                                    applyFilters({ payment_method: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            >
                                <option value="all">All Methods</option>
                                {Object.entries(paymentMethods).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#0E2038] hover:bg-[#1C3E63] text-white dark:bg-[#D4AF37] dark:text-[#071324] dark:hover:bg-[#EBD495] transition"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                title="Reset Filters"
                                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl border border-slate-200 dark:border-[#1C3E63] hover:bg-slate-100 dark:hover:bg-[#071324] transition"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- Orders Data Table --- */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-[#1C3E63]/70 bg-slate-50/75 dark:bg-[#071324]/50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <th className="py-3.5 px-4">Order #</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4">Customer</th>
                                    <th className="py-3.5 px-4 text-center">Items</th>
                                    <th className="py-3.5 px-4">Total Amount</th>
                                    <th className="py-3.5 px-4">Payment</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/40 text-slate-700 dark:text-slate-200">
                                {orders.data && orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-[#071324]/40 transition group"
                                        >
                                            {/* Order Number */}
                                            <td className="py-3 px-4 font-mono font-bold text-xs">
                                                <Link
                                                    href={route('admin.orders.show', order.id)}
                                                    className="text-[#0E2038] dark:text-slate-100 hover:text-[#926F18] dark:hover:text-[#D4AF37] flex items-center gap-1.5"
                                                >
                                                    <span>{order.order_number}</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                                                </Link>
                                            </td>

                                            {/* Date */}
                                            <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                                                <div>{formatDate(order.created_at)}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-xs text-[#0E2038] dark:text-white">
                                                    {order.customer_name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        {order.customer_phone}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[120px]">{order.city}</span>
                                                </div>
                                            </td>

                                            {/* Items Count */}
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#071324] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1C3E63]">
                                                    {order.items_count ?? (order.items ? order.items.length : 1)}
                                                </span>
                                            </td>

                                            {/* Total Amount */}
                                            <td className="py-3 px-4 font-bold text-sm text-[#0E2038] dark:text-[#EBD495]">
                                                {formatCurrency(order.total_amount)}
                                            </td>

                                            {/* Payment */}
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPaymentModal(order)}
                                                        className="hover:opacity-80 transition cursor-pointer"
                                                        title="Click to update payment status"
                                                    >
                                                        {getPaymentStatusBadge(order.payment_status)}
                                                    </button>
                                                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                                                        {paymentMethods[order.payment_method] || order.payment_method}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Order Status */}
                                            <td className="py-3 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => openStatusModal(order)}
                                                    className="hover:opacity-80 transition cursor-pointer"
                                                    title="Click to update order workflow status"
                                                >
                                                    {getOrderStatusBadge(order.order_status)}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={route('admin.orders.show', order.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#071324] transition"
                                                        title="View Order Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.orders.invoice', order.id)}
                                                        target="_blank"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#926F18] dark:hover:text-[#D4AF37] hover:bg-slate-100 dark:hover:bg-[#071324] transition"
                                                        title="Print Commercial Invoice"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-base font-semibold">No orders found.</p>
                                            <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.links && orders.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 dark:border-[#1C3E63]/70">
                            <Pagination links={orders.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* --- Quick Status Update Modal --- */}
            {statusModalOrder && (
                <Modal
                    show={true}
                    onClose={() => setStatusModalOrder(null)}
                    title={`Update Status: ${statusModalOrder.order_number}`}
                    maxWidth="md"
                >
                    <form onSubmit={handleSaveStatus} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Order Workflow Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            >
                                {Object.entries(orderStatuses).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Moving to Delivered automatically sets Cash on Delivery payments to Paid.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Admin Notes (Optional)
                            </label>
                            <textarea
                                rows="3"
                                value={statusNotes}
                                onChange={(e) => setStatusNotes(e.target.value)}
                                placeholder="Add fulfillment remarks, courier tracking number, etc..."
                                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#1C3E63]/70">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setStatusModalOrder(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isUpdatingStatus}
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Save Status'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* --- Quick Payment Update Modal --- */}
            {paymentModalOrder && (
                <Modal
                    show={true}
                    onClose={() => setPaymentModalOrder(null)}
                    title={`Payment Status: ${paymentModalOrder.order_number}`}
                    maxWidth="md"
                >
                    <form onSubmit={handleSavePayment} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Payment Status
                            </label>
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            >
                                {Object.entries(paymentStatuses).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                Admin Payment Remarks (Optional)
                            </label>
                            <textarea
                                rows="3"
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                placeholder="e.g. bKash TrxID: 9JK84M2L confirmed"
                                className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-white dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#1C3E63]/70">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setPaymentModalOrder(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isUpdatingPayment}
                            >
                                {isUpdatingPayment ? 'Saving...' : 'Update Payment'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </AdminLayout>
    );
}
