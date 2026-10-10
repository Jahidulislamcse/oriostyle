import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import Modal from '@/Components/Common/Modal';
import FormInput from '@/Components/Common/FormInput';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import {
    Boxes,
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Truck,
    PackageCheck,
    Calendar,
    Building2,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    Edit3,
    Trash2,
    User,
    Printer,
    DollarSign,
    ArrowRight
} from 'lucide-react';

export default function PurchaseOrderShow({ purchaseOrder }) {
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
    const [receiveProcessing, setReceiveProcessing] = useState(false);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelProcessing, setCancelProcessing] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleReceiveSubmit = (e) => {
        e.preventDefault();
        setReceiveProcessing(true);
        router.post(
            route('admin.purchase-orders.receive', purchaseOrder.id),
            { received_date: receivedDate },
            {
                onSuccess: () => {
                    setIsReceiveModalOpen(false);
                    setReceiveProcessing(false);
                },
                onError: () => setReceiveProcessing(false),
            }
        );
    };

    const handleOrderSubmit = () => {
        router.patch(route('admin.purchase-orders.order', purchaseOrder.id));
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        setCancelProcessing(true);
        router.post(
            route('admin.purchase-orders.cancel', purchaseOrder.id),
            { reason: cancelReason },
            {
                onSuccess: () => {
                    setIsCancelModalOpen(false);
                    setCancelReason('');
                    setCancelProcessing(false);
                },
                onError: () => setCancelProcessing(false),
            }
        );
    };

    const handleDeleteConfirm = () => {
        router.delete(route('admin.purchase-orders.destroy', purchaseOrder.id));
    };

    const getStatusStepState = (step) => {
        if (purchaseOrder.status === 'cancelled') {
            return step === 'draft' ? 'completed' : 'cancelled';
        }
        if (purchaseOrder.status === 'received') {
            return 'completed';
        }
        if (purchaseOrder.status === 'ordered') {
            return step === 'draft' || step === 'ordered' ? 'completed' : 'upcoming';
        }
        // Draft
        return step === 'draft' ? 'active' : 'upcoming';
    };

    const supplier = purchaseOrder.supplier || {};
    const items = purchaseOrder.items || [];

    return (
        <AdminLayout title={`PO: ${purchaseOrder.po_number}`}>
            <Head title={`PO ${purchaseOrder.po_number} - Procurement`} />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.purchase-orders.index')}
                            className="p-2 rounded-lg bg-navy-900 border border-gold-500/20 text-slate-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-bold text-slate-100 font-mono">
                                    {purchaseOrder.po_number}
                                </h1>
                                {purchaseOrder.status === 'received' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Stock Hydrated
                                    </span>
                                )}
                                {purchaseOrder.status === 'ordered' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <Clock className="w-3.5 h-3.5" /> In-Transit
                                    </span>
                                )}
                                {purchaseOrder.status === 'draft' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        <FileText className="w-3.5 h-3.5" /> Draft PO
                                    </span>
                                )}
                                {purchaseOrder.status === 'cancelled' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Created on {purchaseOrder.order_date} by {purchaseOrder.creator?.name || 'Staff'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Receive Stock Button (Draft or Ordered) */}
                        {purchaseOrder.canBeReceived && (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => setIsReceiveModalOpen(true)}
                                icon={<PackageCheck className="w-4 h-4" />}
                            >
                                Receive & Hydrate Stock
                            </Button>
                        )}

                        {/* Mark Ordered Button (Draft only) */}
                        {purchaseOrder.status === 'draft' && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleOrderSubmit}
                                icon={<Truck className="w-4 h-4" />}
                            >
                                Mark as Ordered
                            </Button>
                        )}

                        {/* Edit Button (Draft only) */}
                        {purchaseOrder.status === 'draft' && (
                            <Link href={route('admin.purchase-orders.edit', purchaseOrder.id)}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    icon={<Edit3 className="w-4 h-4" />}
                                >
                                    Edit PO
                                </Button>
                            </Link>
                        )}

                        {/* Cancel Button (Draft or Ordered) */}
                        {(purchaseOrder.status === 'draft' || purchaseOrder.status === 'ordered') && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => setIsCancelModalOpen(true)}
                                icon={<XCircle className="w-4 h-4" />}
                            >
                                Cancel PO
                            </Button>
                        )}

                        {/* Delete Button (Draft or Cancelled) */}
                        {(purchaseOrder.status === 'draft' || purchaseOrder.status === 'cancelled') && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Stepper Progression Bar */}
                <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                        {/* Step 1: Draft */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-gold-500/20 text-gold-400 border border-gold-500/40">
                                1
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-slate-400 block">Step 1</span>
                                <span className="text-sm font-bold text-slate-200">PO Created (Draft)</span>
                            </div>
                        </div>

                        {/* Step 2: Ordered */}
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                purchaseOrder.status === 'ordered' || purchaseOrder.status === 'received'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                                2
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-slate-400 block">Step 2</span>
                                <span className="text-sm font-bold text-slate-200">Dispatched & In-Transit</span>
                            </div>
                        </div>

                        {/* Step 3: Received */}
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                purchaseOrder.status === 'received'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                                3
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-slate-400 block">Step 3</span>
                                <span className="text-sm font-bold text-slate-200">Received & Stock Hydrated</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Line Items & Cost Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items Table Card */}
                        <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="p-4.5 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                    <Boxes className="w-4 h-4 text-gold-400" />
                                    Ordered Products & Stock Impact ({items.length})
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                                        <tr>
                                            <th className="p-4">Item & SKU</th>
                                            <th className="p-4 text-center">Ordered</th>
                                            <th className="p-4 text-center">Received</th>
                                            <th className="p-4 text-right">Unit Cost</th>
                                            <th className="p-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {items.map((item) => {
                                            const prod = item.product || {};
                                            const variant = item.variant;

                                            return (
                                                <tr key={item.id} className="hover:bg-navy-800/30 transition">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-200 text-sm">
                                                            {prod.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                                                            <span className="font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                                                                {variant?.sku || prod.sku || 'SKU'}
                                                            </span>
                                                            {variant && (
                                                                <span>
                                                                    Size: <strong>{variant.size}</strong> {variant.color ? `• Color: ${variant.color}` : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-slate-200">
                                                        {item.quantity_ordered}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {purchaseOrder.status === 'received' ? (
                                                            <span className="font-bold text-emerald-400">
                                                                {item.quantity_received} units
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 italic">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-slate-300">
                                                        {formatCurrency(item.unit_cost)}
                                                    </td>
                                                    <td className="p-4 text-right font-mono font-bold text-emerald-400">
                                                        {formatCurrency(item.subtotal)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {purchaseOrder.notes && (
                            <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gold-400" />
                                    Procurement Notes & Audit History
                                </h3>
                                <p className="text-sm text-slate-300 whitespace-pre-line bg-navy-950 p-3.5 rounded-lg border border-slate-800">
                                    {purchaseOrder.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right 1 Col: Vendor Profile, Cost Totals & Timeline */}
                    <div className="space-y-6">
                        {/* Cost Totals Card */}
                        <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                                Financial Breakdown
                            </h3>

                            <div className="space-y-2.5 text-sm pt-1">
                                <div className="flex justify-between text-slate-300">
                                    <span>Items Subtotal:</span>
                                    <span className="font-mono font-bold text-slate-100">{formatCurrency(purchaseOrder.subtotal)}</span>
                                </div>

                                {parseFloat(purchaseOrder.shipping_cost) > 0 && (
                                    <div className="flex justify-between text-slate-400 text-xs">
                                        <span>Shipping / Freight:</span>
                                        <span className="font-mono text-slate-200">+{formatCurrency(purchaseOrder.shipping_cost)}</span>
                                    </div>
                                )}

                                {parseFloat(purchaseOrder.tax_amount) > 0 && (
                                    <div className="flex justify-between text-slate-400 text-xs">
                                        <span>Tax / Duties:</span>
                                        <span className="font-mono text-slate-200">+{formatCurrency(purchaseOrder.tax_amount)}</span>
                                    </div>
                                )}

                                {parseFloat(purchaseOrder.discount_amount) > 0 && (
                                    <div className="flex justify-between text-slate-400 text-xs">
                                        <span>Vendor Discount:</span>
                                        <span className="font-mono text-emerald-400">-{formatCurrency(purchaseOrder.discount_amount)}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base">
                                    <span className="font-bold text-slate-200">Grand Total:</span>
                                    <span className="font-mono text-xl font-black text-emerald-400">
                                        {formatCurrency(purchaseOrder.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Card */}
                        <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Vendor Account
                                </h3>
                                <Link
                                    href={route('admin.suppliers.show', supplier.id || 1)}
                                    className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1"
                                >
                                    View Ledger <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2.5 text-slate-200">
                                    <Building2 className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold block">{supplier.name}</span>
                                        {supplier.company_name && (
                                            <span className="text-xs text-slate-400 block">{supplier.company_name}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 text-slate-300 text-xs">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    <span className="font-mono">{supplier.phone}</span>
                                </div>

                                {supplier.email && (
                                    <div className="flex items-center gap-2.5 text-slate-300 text-xs">
                                        <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                        <span>{supplier.email}</span>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                                    <span className="text-slate-400">Payable Balance:</span>
                                    <strong className="text-rose-400 font-mono text-sm">
                                        {formatCurrency(supplier.current_balance)}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Timeline / Receiver Info */}
                        <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-3 text-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Lifecycle Details
                            </h3>

                            <div className="space-y-2 text-slate-300">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Order Placed Date:</span>
                                    <span>{purchaseOrder.order_date}</span>
                                </div>

                                {purchaseOrder.expected_delivery_date && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Expected Delivery:</span>
                                        <span>{purchaseOrder.expected_delivery_date}</span>
                                    </div>
                                )}

                                {purchaseOrder.received_date && (
                                    <div className="flex justify-between text-emerald-400 font-bold">
                                        <span>Received On:</span>
                                        <span>{purchaseOrder.received_date}</span>
                                    </div>
                                )}

                                {purchaseOrder.receiver && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Received By Staff:</span>
                                        <span>{purchaseOrder.receiver.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receive & Hydrate Stock Modal */}
            <Modal
                isOpen={isReceiveModalOpen}
                onClose={() => setIsReceiveModalOpen(false)}
                title={`Receive Stock: ${purchaseOrder.po_number}`}
                maxWidth="md"
            >
                <form onSubmit={handleReceiveSubmit} className="space-y-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                        <PackageCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                        <div>
                            <strong className="block font-bold">Inventory & Financial Impact:</strong>
                            <p className="mt-1 text-slate-300">
                                Confirming will hydrate inventory stock for all {items.length} product line items, recalculate weighted COGS, and automatically post a bill to {supplier.name}'s payable balance ledger.
                            </p>
                        </div>
                    </div>

                    <FormInput
                        label="Stock-In Received Date"
                        type="date"
                        required
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                    />

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsReceiveModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={receiveProcessing}
                            icon={<PackageCheck className="w-4 h-4" />}
                        >
                            Confirm Stock-In & Receive
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={`Cancel PO: ${purchaseOrder.po_number}`}
                maxWidth="md"
            >
                <form onSubmit={handleCancelSubmit} className="space-y-4">
                    <p className="text-sm text-slate-300">
                        Are you sure you want to cancel Purchase Order <strong className="text-gold-400">{purchaseOrder.po_number}</strong>?
                    </p>

                    <FormInput
                        label="Cancellation Reason (Optional)"
                        placeholder="e.g. Vendor unable to supply"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCancelModalOpen(false)}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            loading={cancelProcessing}
                        >
                            Confirm Cancellation
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Purchase Order"
                message={`Are you sure you want to permanently delete PO "${purchaseOrder.po_number}"?`}
                confirmText="Delete PO"
                type="danger"
            />
        </AdminLayout>
    );
}
