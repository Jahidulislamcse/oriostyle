import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import ConfirmDialog from '@/Components/Common/ConfirmDialog';
import DataTable from '@/Components/Common/DataTable';
import {
    Boxes,
    Plus,
    Search,
    FileText,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Edit3,
    Trash2,
    Calendar,
    DollarSign,
    PackageCheck,
    AlertCircle,
    Building2,
    ArrowUpRight
} from 'lucide-react';

export default function PurchaseOrderIndex({
    purchaseOrders = { data: [] },
    metrics = {},
    filters = {},
    suppliers = [],
}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [supplierFilter, setSupplierFilter] = useState(filters.supplier_id || 'all');

    // Receiving modal state
    const [receivingPo, setReceivingPo] = useState(null);
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
    const [receivingProcessing, setReceivingProcessing] = useState(false);

    // Cancel modal state
    const [cancellingPo, setCancellingPo] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancellingProcessing, setCancellingProcessing] = useState(false);

    // Delete modal state
    const [deletingPo, setDeletingPo] = useState(null);

    const applyFilters = (newSearch = searchQuery, newStatus = statusFilter, newSupplier = supplierFilter) => {
        router.get(
            route('admin.purchase-orders.index'),
            { search: newSearch, status: newStatus, supplier_id: newSupplier },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'received':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Received
                    </span>
                );
            case 'ordered':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Ordered
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <FileText className="w-3.5 h-3.5" /> Draft
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled
                    </span>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleReceiveSubmit = (e) => {
        e.preventDefault();
        if (!receivingPo) return;
        setReceivingProcessing(true);
        router.post(
            route('admin.purchase-orders.receive', receivingPo.id),
            { received_date: receivedDate },
            {
                onSuccess: () => {
                    setReceivingPo(null);
                    setReceivingProcessing(false);
                },
                onError: () => setReceivingProcessing(false),
            }
        );
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        if (!cancellingPo) return;
        setCancellingProcessing(true);
        router.post(
            route('admin.purchase-orders.cancel', cancellingPo.id),
            { reason: cancelReason },
            {
                onSuccess: () => {
                    setCancellingPo(null);
                    setCancelReason('');
                    setCancellingProcessing(false);
                },
                onError: () => setCancellingProcessing(false),
            }
        );
    };

    const handleDelete = () => {
        if (!deletingPo) return;
        router.delete(route('admin.purchase-orders.destroy', deletingPo.id), {
            onSuccess: () => setDeletingPo(null),
        });
    };

    const columns = [
        {
            key: 'po_number',
            label: 'PO Number & Date',
            render: (val, row) => (
                <div>
                    <Link
                        href={route('admin.purchase-orders.show', row.id)}
                        className="font-mono text-sm font-bold text-gold-400 hover:text-gold-300 hover:underline flex items-center gap-1"
                    >
                        {row.po_number}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Ordered: {row.order_date}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'supplier',
            label: 'Vendor / Supplier',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gold-400" />
                        {row.supplier?.name || '—'}
                    </div>
                    {row.supplier?.company_name && (
                        <span className="text-xs text-slate-400 block mt-0.5">
                            {row.supplier.company_name}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, row) => getStatusBadge(row.status),
        },
        {
            key: 'items_count',
            label: 'Line Items',
            render: (val, row) => (
                <div className="text-xs">
                    <span className="font-bold text-slate-200">
                        {row.items?.length || 0} Products
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                        {row.items?.reduce((sum, item) => sum + (item.quantity_ordered || 0), 0)} Total Units
                    </span>
                </div>
            ),
        },
        {
            key: 'total_amount',
            label: 'Total PO Value',
            className: 'text-right',
            render: (val, row) => (
                <div className="text-right">
                    <span className="font-mono text-sm font-black text-emerald-400 block">
                        {formatCurrency(row.total_amount)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                        Subtotal: {formatCurrency(row.subtotal)}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'text-right',
            render: (val, row) => (
                <div className="flex items-center justify-end gap-1">
                    {/* View Details */}
                    <Link
                        href={route('admin.purchase-orders.show', row.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-navy-800 transition-colors"
                        title="View PO Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>

                    {/* Receive Stock button if draft or ordered */}
                    {(row.status === 'draft' || row.status === 'ordered') && (
                        <button
                            type="button"
                            onClick={() => {
                                setReceivingPo(row);
                                setReceivedDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                            title="Receive Stock & Update Inventory"
                        >
                            <PackageCheck className="w-4 h-4" />
                        </button>
                    )}

                    {/* Edit button if draft */}
                    {row.status === 'draft' && (
                        <Link
                            href={route('admin.purchase-orders.edit', row.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-navy-800 transition-colors"
                            title="Edit Draft Order"
                        >
                            <Edit3 className="w-4 h-4" />
                        </Link>
                    )}

                    {/* Cancel button if draft or ordered */}
                    {(row.status === 'draft' || row.status === 'ordered') && (
                        <button
                            type="button"
                            onClick={() => {
                                setCancellingPo(row);
                                setCancelReason('');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Cancel Purchase Order"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}

                    {/* Delete button if draft or cancelled */}
                    {(row.status === 'draft' || row.status === 'cancelled') && (
                        <button
                            type="button"
                            onClick={() => setDeletingPo(row)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                            title="Delete Record"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const poList = purchaseOrders.data || [];

    return (
        <AdminLayout title="Stock-In Purchase Orders">
            <Head title="Stock-In Purchase Orders - Procurement" />

            <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
                            <Boxes className="w-7 h-7 text-gold-400" />
                            Stock-In Purchase Orders
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Purchase order entry, stock hydration, and automated weighted COGS calculation.
                        </p>
                    </div>

                    <Link href={route('admin.purchase-orders.create')}>
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                            Create Purchase Order
                        </Button>
                    </Link>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4.5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Purchase Orders</span>
                            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
                                <Boxes className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-100 mt-2 font-mono">
                            {metrics.total_orders || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            All procurement records
                        </span>
                    </div>

                    <div className="bg-navy-900/60 border border-amber-500/30 rounded-xl p-4.5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">In-Transit / Ordered</span>
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
                            {metrics.pending_orders || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Value: <strong className="text-amber-300 font-mono">{formatCurrency(metrics.total_ordered_value)}</strong>
                        </span>
                    </div>

                    <div className="bg-navy-900/60 border border-emerald-500/30 rounded-xl p-4.5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Received & Hydrated</span>
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                            {metrics.received_orders || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Value: <strong className="text-emerald-300 font-mono">{formatCurrency(metrics.total_received_value)}</strong>
                        </span>
                    </div>

                    <div className="bg-navy-900/60 border border-blue-500/30 rounded-xl p-4.5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Draft Orders</span>
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-blue-400 mt-2 font-mono">
                            {metrics.draft_orders || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Awaiting supplier placement
                        </span>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by PO# or supplier..."
                                className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        <FormSelect
                            label=""
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters(searchQuery, e.target.value, supplierFilter);
                            }}
                            className="w-40 text-sm"
                            options={[
                                { label: 'All Statuses', value: 'all' },
                                { label: 'Draft', value: 'draft' },
                                { label: 'Ordered', value: 'ordered' },
                                { label: 'Received', value: 'received' },
                                { label: 'Cancelled', value: 'cancelled' },
                            ]}
                        />

                        <FormSelect
                            label=""
                            value={supplierFilter}
                            onChange={(e) => {
                                setSupplierFilter(e.target.value);
                                applyFilters(searchQuery, statusFilter, e.target.value);
                            }}
                            className="w-48 text-sm"
                            options={[
                                { label: 'All Suppliers', value: 'all' },
                                ...suppliers.map((s) => ({
                                    label: s.company_name ? `${s.name} (${s.company_name})` : s.name,
                                    value: String(s.id),
                                })),
                            ]}
                        />
                    </div>
                </div>

                {/* Purchase Orders Data Table */}
                <DataTable
                    columns={columns}
                    data={poList}
                    searchable={false}
                    emptyMessage="No purchase orders found. Click 'Create Purchase Order' to initiate vendor stock replenishment."
                    pagination={purchaseOrders}
                />
            </div>

            {/* Quick Stock-In Receive Modal */}
            <Modal
                isOpen={Boolean(receivingPo)}
                onClose={() => setReceivingPo(null)}
                title={`Receive Stock: ${receivingPo?.po_number || ''}`}
                maxWidth="md"
            >
                <form onSubmit={handleReceiveSubmit} className="space-y-4">
                    <div className="p-4 rounded-xl bg-navy-950 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Vendor:</span>
                            <span className="font-bold text-slate-200">{receivingPo?.supplier?.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Total Purchase Value:</span>
                            <span className="font-black text-emerald-400 font-mono">
                                {formatCurrency(receivingPo?.total_amount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Line Items to Hydrate:</span>
                            <span className="font-bold text-slate-200">{receivingPo?.items?.length || 0} Products</span>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Automatic System Actions:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                                <li>Product and variant inventory stock will be immediately incremented.</li>
                                <li>Weighted average Cost of Goods Sold (COGS) will be updated.</li>
                                <li>A purchase bill will be posted to the supplier's payable balance ledger.</li>
                            </ul>
                        </div>
                    </div>

                    <FormInput
                        label="Received Date"
                        type="date"
                        required
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                    />

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setReceivingPo(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={receivingProcessing}
                            icon={<PackageCheck className="w-4 h-4" />}
                        >
                            Confirm Stock-In & Receive
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
                isOpen={Boolean(cancellingPo)}
                onClose={() => setCancellingPo(null)}
                title={`Cancel PO: ${cancellingPo?.po_number || ''}`}
                maxWidth="md"
            >
                <form onSubmit={handleCancelSubmit} className="space-y-4">
                    <p className="text-sm text-slate-300">
                        Are you sure you want to cancel Purchase Order <strong className="text-gold-400">{cancellingPo?.po_number}</strong>?
                        This will prevent any further receiving or stock additions.
                    </p>

                    <FormInput
                        label="Cancellation Reason (Optional)"
                        placeholder="e.g. Vendor out of stock, cancelled by mutual consent"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCancellingPo(null)}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            loading={cancellingProcessing}
                        >
                            Confirm Cancellation
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={Boolean(deletingPo)}
                onClose={() => setDeletingPo(null)}
                onConfirm={handleDelete}
                title="Delete Purchase Order"
                message={`Are you sure you want to permanently delete PO "${deletingPo?.po_number}"? This action cannot be undone.`}
                confirmText="Delete PO"
                type="danger"
            />
        </AdminLayout>
    );
}
