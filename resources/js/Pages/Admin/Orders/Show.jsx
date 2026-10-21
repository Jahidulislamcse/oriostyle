import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import {
    ShoppingBag,
    ArrowLeft,
    Printer,
    CheckCircle2,
    Clock,
    Truck,
    PackageCheck,
    XCircle,
    RotateCcw,
    DollarSign,
    Phone,
    Mail,
    MapPin,
    Calendar,
    CreditCard,
    FileText,
    User,
    ShieldAlert,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

export default function OrderShow({
    order = {},
    orderStatuses = {},
    paymentStatuses = {},
    paymentMethods = {},
}) {
    const [orderStatus, setOrderStatus] = useState(order.order_status || 'pending');
    const [statusNotes, setStatusNotes] = useState(order.admin_notes || '');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [paymentStatus, setPaymentStatus] = useState(order.payment_status || 'unpaid');
    const [paymentNotes, setPaymentNotes] = useState(order.admin_notes || '');
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

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

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        setIsUpdatingStatus(true);
        router.patch(
            route('admin.orders.status', order.id),
            {
                order_status: orderStatus,
                admin_notes: statusNotes,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdatingStatus(false),
            }
        );
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setIsUpdatingPayment(true);
        router.patch(
            route('admin.orders.payment', order.id),
            {
                payment_status: paymentStatus,
                admin_notes: paymentNotes,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdatingPayment(false),
            }
        );
    };

    const pipelineSteps = [
        { key: 'pending', label: 'Pending', icon: Clock },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
        { key: 'processing', label: 'Processing', icon: Truck },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: PackageCheck },
    ];

    const currentStepIndex = pipelineSteps.findIndex((s) => s.key === order.order_status);
    const isCancelled = order.order_status === 'cancelled';
    const isReturned = order.order_status === 'returned';

    return (
        <AdminLayout title={`Order ${order.order_number}`}>
            <Head title={`Order ${order.order_number} | ORIO Admin`} />

            <div className="space-y-6">
                {/* --- Top Navigation & Quick Actions --- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.orders.index')}
                            className="p-2 rounded-xl border border-slate-200 dark:border-[#1C3E63] hover:bg-slate-100 dark:hover:bg-[#071324] text-slate-500 dark:text-slate-300 transition"
                            title="Back to Orders List"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-[#0E2038] dark:text-white uppercase font-mono">
                                    {order.order_number}
                                </h1>
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                    order.payment_status === 'paid'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                    {(order.payment_status || 'unpaid').toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Placed on {formatDateTime(order.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.orders.invoice', order.id)}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] text-slate-700 dark:text-slate-200 hover:border-[#D4AF37] hover:text-[#926F18] dark:hover:text-[#D4AF37] shadow-xs transition"
                        >
                            <Printer className="w-4 h-4" />
                            Print Invoice
                        </Link>
                    </div>
                </div>

                {/* --- Order Workflow Stepper --- */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 shadow-xs">
                    {isCancelled ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                            <XCircle className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Order Cancelled</h4>
                                <p className="text-xs text-rose-400 mt-0.5">
                                    This order was cancelled on {formatDateTime(order.cancelled_at || order.updated_at)}.
                                </p>
                            </div>
                        </div>
                    ) : isReturned ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400">
                            <RotateCcw className="w-6 h-6 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-sm">Parcel Returned</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    This parcel was returned by customer or courier.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                Fulfillment Pipeline
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {pipelineSteps.map((step, idx) => {
                                    const isCompleted = currentStepIndex >= idx;
                                    const isCurrent = currentStepIndex === idx;
                                    const StepIcon = step.icon;

                                    return (
                                        <div
                                            key={step.key}
                                            className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                                                isCurrent
                                                    ? 'bg-[#0E2038] dark:bg-[#D4AF37] text-white dark:text-[#071324] border-[#0E2038] dark:border-[#D4AF37] shadow-sm font-bold'
                                                    : isCompleted
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                                                    : 'bg-slate-50 dark:bg-[#071324]/50 border-slate-200 dark:border-[#1C3E63]/60 text-slate-400'
                                            }`}
                                        >
                                            <StepIcon className="w-5 h-5 mb-1" />
                                            <span className="text-xs uppercase tracking-wider">{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Main 2-Column Content Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* --- Left Column: Line Items & Financials (2 cols) --- */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Line Items Card */}
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl shadow-xs overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                                <h3 className="font-bold text-sm text-[#0E2038] dark:text-white uppercase tracking-wider">
                                    Ordered Items ({order.items ? order.items.length : 0})
                                </h3>
                                <span className="text-xs text-slate-400 font-mono">
                                    Currency: {order.currency || 'BDT'}
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-[#1C3E63]/40 bg-slate-50/75 dark:bg-[#071324]/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            <th className="py-3 px-4">Item Description</th>
                                            <th className="py-3 px-4 text-center">Unit Price</th>
                                            <th className="py-3 px-4 text-center">Qty</th>
                                            <th className="py-3 px-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/40">
                                        {order.items && order.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071324]/30">
                                                {/* Product Info */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-14 rounded-lg bg-slate-100 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={item.image_url}
                                                                    alt={item.product_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs text-[#0E2038] dark:text-white">
                                                                {item.product_name}
                                                            </div>
                                                            {item.product_sku && (
                                                                <div className="text-[11px] text-slate-400 font-mono">
                                                                    SKU: {item.product_sku}
                                                                </div>
                                                            )}
                                                            {item.formatted_variant && (
                                                                <div className="text-[11px] text-[#926F18] dark:text-[#D4AF37] font-semibold mt-0.5">
                                                                    {item.formatted_variant}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Unit Price */}
                                                <td className="py-3.5 px-4 text-center font-mono text-xs">
                                                    {formatCurrency(item.unit_price)}
                                                </td>

                                                {/* Quantity */}
                                                <td className="py-3.5 px-4 text-center font-bold text-xs">
                                                    x{item.quantity}
                                                </td>

                                                {/* Line Total */}
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-xs text-[#0E2038] dark:text-white">
                                                    {formatCurrency(item.line_total)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Calculations */}
                            <div className="p-4 bg-slate-50/75 dark:bg-[#071324]/60 border-t border-slate-200 dark:border-[#1C3E63]/70">
                                <div className="max-w-xs ms-auto space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span>Subtotal</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                                            {formatCurrency(order.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span>Delivery / Shipping Charge</span>
                                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                                            {formatCurrency(order.shipping_charge)}
                                        </span>
                                    </div>
                                    {Number(order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-emerald-500">
                                            <span>Promotional Discount</span>
                                            <span className="font-mono font-semibold">
                                                -{formatCurrency(order.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-slate-200 dark:border-[#1C3E63] flex justify-between text-sm font-bold text-[#0E2038] dark:text-[#EBD495]">
                                        <span>Grand Total</span>
                                        <span className="font-mono text-base">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Notes & Admin Log */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Notes */}
                            <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Customer Remarks
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                                    {order.customer_notes || 'No special delivery instructions provided by client.'}
                                </p>
                            </div>

                            {/* Admin Notes */}
                            <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 shadow-xs">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Internal Staff Notes
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    {order.admin_notes || 'No internal remarks logged.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Fulfillment Controls & Client Details (1 col) --- */}
                    <div className="space-y-6">
                        {/* Fulfillment Status Control Card */}
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 shadow-xs">
                            <h3 className="font-bold text-sm text-[#0E2038] dark:text-white uppercase tracking-wider mb-3">
                                Update Fulfillment Status
                            </h3>
                            <form onSubmit={handleStatusSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Workflow Stage
                                    </label>
                                    <select
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                                    >
                                        {Object.entries(orderStatuses).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Fulfillment / Tracking Remarks
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                        placeholder="e.g. Dispatched via Pathao / Steadfast..."
                                        className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full justify-center"
                                    disabled={isUpdatingStatus}
                                >
                                    {isUpdatingStatus ? 'Saving...' : 'Update Status'}
                                </Button>
                            </form>
                        </div>

                        {/* Payment Details & Update Card */}
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 shadow-xs">
                            <h3 className="font-bold text-sm text-[#0E2038] dark:text-white uppercase tracking-wider mb-3">
                                Payment Details
                            </h3>

                            <div className="space-y-2 mb-4 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Payment Gateway</span>
                                    <span className="font-bold uppercase text-slate-700 dark:text-slate-200">
                                        {paymentMethods[order.payment_method] || order.payment_method}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Payment Status</span>
                                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                                        order.payment_status === 'paid'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                        {(order.payment_status || 'unpaid').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#1C3E63]/50">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Change Payment Status
                                    </label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-[#1C3E63] bg-slate-50 dark:bg-[#071324] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/50"
                                    >
                                        {Object.entries(paymentStatuses).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full justify-center"
                                    disabled={isUpdatingPayment}
                                >
                                    {isUpdatingPayment ? 'Saving...' : 'Update Payment'}
                                </Button>
                            </form>
                        </div>

                        {/* Customer & Shipping Information Card */}
                        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-[#0E2038] dark:text-white uppercase tracking-wider">
                                Customer & Shipping
                            </h3>

                            {/* Client Name & Phone */}
                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="text-slate-400 text-[11px] uppercase tracking-wider block">Recipient</span>
                                    <span className="font-bold text-sm text-[#0E2038] dark:text-white">
                                        {order.customer_name}
                                    </span>
                                    {order.user && (
                                        <span className="ms-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#926F18] dark:text-[#EBD495]">
                                            Member #{order.user.id}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-1 text-slate-600 dark:text-slate-300">
                                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                                    <a href={`tel:${order.customer_phone}`} className="hover:underline font-mono">
                                        {order.customer_phone}
                                    </a>
                                </div>

                                {order.customer_email && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <a href={`mailto:${order.customer_email}`} className="hover:underline truncate">
                                            {order.customer_email}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div className="pt-3 border-t border-slate-100 dark:border-[#1C3E63]/50 text-xs">
                                <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Delivery Destination
                                </span>
                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                                    {order.shipping_address}
                                </p>
                                <div className="mt-1 text-slate-400 font-semibold">
                                    {order.city} {order.postal_code ? `- ${order.postal_code}` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
