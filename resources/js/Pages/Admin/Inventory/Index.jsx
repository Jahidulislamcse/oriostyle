import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import DataTable from '@/Components/Common/DataTable';
import {
    Boxes,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Plus,
    Minus,
    Sliders,
    History,
    Trash2,
    DollarSign,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown,
    Building2,
    FileText,
    Calendar,
    User,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';

export default function InventoryIndex({
    metrics = {},
    stockSummary = { data: [] },
    ledger = { data: [] },
    damageLogs = { data: [] },
    categories = [],
    products = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState(filters.active_tab || 'overview'); // 'overview', 'ledger', 'damage'

    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [stockStatusFilter, setStockStatusFilter] = useState(filters.stock_status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || 'all');
    const [movementTypeFilter, setMovementTypeFilter] = useState(filters.type || 'all');

    // Adjustment Modal State
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustProductId, setAdjustProductId] = useState('');
    const [adjustVariantId, setAdjustVariantId] = useState('');
    const [adjustAction, setAdjustAction] = useState('increase'); // increase, decrease, set_exact
    const [adjustQuantity, setAdjustQuantity] = useState(1);
    const [adjustReason, setAdjustReason] = useState('Cycle count audit discrepancy');
    const [adjustNotes, setAdjustNotes] = useState('');
    const [adjustProcessing, setAdjustProcessing] = useState(false);

    // Damage Modal State
    const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
    const [damageProductId, setDamageProductId] = useState('');
    const [damageVariantId, setDamageVariantId] = useState('');
    const [damageQuantity, setDamageQuantity] = useState(1);
    const [damageReason, setDamageReason] = useState('transit_damage');
    const [damageNotes, setDamageNotes] = useState('');
    const [damageProcessing, setDamageProcessing] = useState(false);

    // Threshold Modal State
    const [thresholdProduct, setThresholdProduct] = useState(null);
    const [newThreshold, setNewThreshold] = useState(5);
    const [thresholdProcessing, setThresholdProcessing] = useState(false);

    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const applyFilters = (tab = activeTab) => {
        router.get(
            '/admin/inventory',
            {
                active_tab: tab,
                search: searchQuery,
                stock_status: stockStatusFilter,
                category_id: categoryFilter,
                type: movementTypeFilter,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters(activeTab);
    };

    // Open adjust modal with pre-selected product
    const openAdjustModal = (product = null) => {
        if (product) {
            setAdjustProductId(String(product.id));
            setAdjustVariantId('');
        } else if (products.length > 0) {
            setAdjustProductId(String(products[0].id));
            setAdjustVariantId('');
        }
        setAdjustAction('increase');
        setAdjustQuantity(1);
        setAdjustReason('Cycle count audit discrepancy');
        setAdjustNotes('');
        setIsAdjustModalOpen(true);
    };

    // Open damage modal with pre-selected product
    const openDamageModal = (product = null) => {
        if (product) {
            setDamageProductId(String(product.id));
            setDamageVariantId('');
        } else if (products.length > 0) {
            setDamageProductId(String(products[0].id));
            setDamageVariantId('');
        }
        setDamageQuantity(1);
        setDamageReason('transit_damage');
        setDamageNotes('');
        setIsDamageModalOpen(true);
    };

    // Handle stock adjustment submission
    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        setAdjustProcessing(true);
        router.post(
            '/admin/inventory/adjust',
            {
                product_id: adjustProductId,
                product_variant_id: adjustVariantId || null,
                action: adjustAction,
                quantity: adjustQuantity,
                reason: adjustReason,
                notes: adjustNotes,
            },
            {
                onSuccess: () => {
                    setIsAdjustModalOpen(false);
                    setAdjustProcessing(false);
                },
                onError: () => setAdjustProcessing(false),
            }
        );
    };

    // Handle damage log submission
    const handleDamageSubmit = (e) => {
        e.preventDefault();
        setDamageProcessing(true);
        router.post(
            '/admin/inventory/damage',
            {
                product_id: damageProductId,
                product_variant_id: damageVariantId || null,
                quantity: damageQuantity,
                reason: damageReason,
                notes: damageNotes,
            },
            {
                onSuccess: () => {
                    setIsDamageModalOpen(false);
                    setDamageProcessing(false);
                },
                onError: () => setDamageProcessing(false),
            }
        );
    };

    // Handle threshold submission
    const handleThresholdSubmit = (e) => {
        e.preventDefault();
        if (!thresholdProduct) return;
        setThresholdProcessing(true);
        router.patch(
            `/admin/inventory/products/${thresholdProduct.id}/threshold`,
            { low_stock_threshold: newThreshold },
            {
                onSuccess: () => {
                    setThresholdProduct(null);
                    setThresholdProcessing(false);
                },
                onError: () => setThresholdProcessing(false),
            }
        );
    };

    // Current selected product for adjust modal helper
    const selectedAdjustProduct = products.find((p) => String(p.id) === String(adjustProductId));
    const selectedAdjustVariants = selectedAdjustProduct?.variants || [];
    const selectedAdjustCurrentStock = adjustVariantId
        ? (selectedAdjustVariants.find((v) => String(v.id) === String(adjustVariantId))?.stock_quantity ?? 0)
        : (selectedAdjustProduct?.stock_quantity ?? 0);

    // Current selected product for damage modal helper
    const selectedDamageProduct = products.find((p) => String(p.id) === String(damageProductId));
    const selectedDamageVariants = selectedDamageProduct?.variants || [];
    const selectedDamageCurrentStock = damageVariantId
        ? (selectedDamageVariants.find((v) => String(v.id) === String(damageVariantId))?.stock_quantity ?? 0)
        : (selectedDamageProduct?.stock_quantity ?? 0);

    // Stock Summary Table Columns
    const stockColumns = [
        {
            key: 'name',
            label: 'Product & SKU',
            render: (val, row) => {
                const item = row || val || {};
                const variantsCount = item.variants?.length || 0;
                return (
                    <div>
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {variantsCount > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-gold-400 border border-gold-500/30">
                                    {variantsCount} Variants
                                </span>
                            )}
                        </div>
                        <span className="font-mono text-xs text-gold-400 block mt-0.5">
                            SKU: {item.sku}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'category',
            label: 'Category & Unit Cost',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="text-xs">
                        <span className="text-slate-300 font-medium block">
                            {item.category?.name || 'Uncategorized'}
                        </span>
                        <span className="text-slate-400 font-mono mt-0.5 block">
                            Cost: {formatCurrency(item.cost_price || 0)}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'stock_quantity',
            label: 'Current Stock',
            render: (val, row) => {
                const item = row || val || {};
                const stock = Number(item.stock_quantity || 0);
                const threshold = Number(item.low_stock_threshold || 5);
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= threshold;

                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono text-base font-black ${
                                isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                                {stock}
                            </span>
                            <span className="text-xs text-slate-400">units</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <span>Alert Threshold:</span>
                            <span className="font-mono font-bold text-slate-300">{threshold}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: 'Stock Urgency',
            render: (val, row) => {
                const item = row || val || {};
                const stock = Number(item.stock_quantity || 0);
                const threshold = Number(item.low_stock_threshold || 5);

                if (stock <= 0) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                    );
                }
                if (stock <= threshold) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Urgency
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Stock
                    </span>
                );
            },
        },
        {
            key: 'total_value',
            label: 'Stock Value',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (val, row) => {
                const item = row || val || {};
                const totalVal = (Number(item.stock_quantity) || 0) * (Number(item.cost_price) || 0);
                return (
                    <span className="font-mono text-sm font-bold text-slate-200">
                        {formatCurrency(totalVal)}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'text-right',
            cellClassName: 'text-right',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Adjust Stock */}
                        <button
                            type="button"
                            onClick={() => openAdjustModal(item)}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 text-gold-400 hover:bg-gold-500/10 border border-gold-500/20 hover:border-gold-500/50 transition cursor-pointer gap-1"
                            title="Adjust Stock Quantity"
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust</span>
                        </button>

                        {/* Set Threshold */}
                        <button
                            type="button"
                            onClick={() => {
                                setThresholdProduct(item);
                                setNewThreshold(item.low_stock_threshold || 5);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-navy-800 transition cursor-pointer"
                            title="Update Low Stock Alert Threshold"
                        >
                            <AlertTriangle className="w-4 h-4" />
                        </button>

                        {/* Log Damage */}
                        <button
                            type="button"
                            onClick={() => openDamageModal(item)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition cursor-pointer"
                            title="Log Damaged Stock Write-off"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    // Ledger Movement Columns
    const ledgerColumns = [
        {
            key: 'created_at',
            label: 'Timestamp',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="text-xs">
                        <span className="font-mono text-slate-200 font-bold block">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </span>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                            {item.created_at ? new Date(item.created_at).toLocaleTimeString() : ''}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'product',
            label: 'Product / Variant',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div>
                        <span className="font-bold text-slate-100 text-sm block">
                            {item.product?.name || '—'}
                        </span>
                        {item.variant && (
                            <span className="text-xs text-gold-400 block font-mono">
                                Variant: {item.variant.sku || `${item.variant.size || ''} ${item.variant.color || ''}`}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'type',
            label: 'Movement Type',
            render: (val, row) => {
                const item = row || val || {};
                switch (item.type) {
                    case 'purchase_in':
                        return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <ArrowUpRight className="w-3 h-3" /> PO Stock-In
                            </span>
                        );
                    case 'adjustment_increase':
                        return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Plus className="w-3 h-3" /> Stock Increase
                            </span>
                        );
                    case 'adjustment_decrease':
                        return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Minus className="w-3 h-3" /> Stock Decrease
                            </span>
                        );
                    case 'damage_loss':
                        return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <TrendingDown className="w-3 h-3" /> Damage Loss
                            </span>
                        );
                    case 'order_out':
                        return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <ArrowDownRight className="w-3 h-3" /> Order Fulfillment
                            </span>
                        );
                    default:
                        return <Badge variant="secondary">{item.type}</Badge>;
                }
            },
        },
        {
            key: 'quantity',
            label: 'Quantity Delta',
            render: (val, row) => {
                const item = row || val || {};
                const qty = Number(item.quantity || 0);
                return (
                    <span className={`font-mono text-sm font-black ${qty > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {qty > 0 ? `+${qty}` : qty} units
                    </span>
                );
            },
        },
        {
            key: 'balance',
            label: 'Stock Before → After',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="font-mono text-xs text-slate-300">
                        {item.quantity_before} → <strong className="text-gold-400 font-bold">{item.quantity_after}</strong>
                    </span>
                );
            },
        },
        {
            key: 'reason',
            label: 'Reason & Notes',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="text-xs max-w-xs truncate">
                        <span className="text-slate-200 font-medium block truncate">
                            {item.reason || '—'}
                        </span>
                        {item.notes && (
                            <span className="text-slate-400 block truncate mt-0.5">
                                {item.notes}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'creator',
            label: 'Staff',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {item.creator?.name || 'System'}
                    </span>
                );
            },
        },
    ];

    // Damage Logs Table Columns
    const damageColumns = [
        {
            key: 'damage_number',
            label: 'Damage # & Date',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div>
                        <span className="font-mono text-sm font-bold text-rose-400 block">
                            {item.damage_number}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'product',
            label: 'Product / Variant',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div>
                        <span className="font-bold text-slate-100 text-sm block">
                            {item.product?.name || '—'}
                        </span>
                        {item.variant && (
                            <span className="text-xs text-gold-400 block font-mono">
                                Variant: {item.variant.sku}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'quantity',
            label: 'Damaged Qty',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="font-mono text-sm font-black text-rose-400">
                        {item.quantity} units
                    </span>
                );
            },
        },
        {
            key: 'loss_amount',
            label: 'Financial Loss',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div>
                        <span className="font-mono text-sm font-black text-rose-400 block">
                            {formatCurrency(item.total_loss_amount)}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                            Unit Cost: {formatCurrency(item.unit_cost)}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'reason',
            label: 'Damage Cause',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 capitalize">
                        {String(item.reason).replace(/_/g, ' ')}
                    </span>
                );
            },
        },
        {
            key: 'notes',
            label: 'Audit Notes',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="text-xs text-slate-400 block max-w-xs truncate">
                        {item.notes || '—'}
                    </span>
                );
            },
        },
        {
            key: 'reporter',
            label: 'Reported By',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {item.reporter?.name || 'Admin'}
                    </span>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Inventory Ledger & Adjustments">
            <Head title="Inventory Ledger & Stock Adjustments - Procurement" />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
                            <Boxes className="w-7 h-7 text-gold-400" />
                            Inventory Ledger & Adjustments
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Real-time stock valuation, low stock urgency alerts, damage loss write-offs, and movement audit trail.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="secondary"
                            onClick={() => openDamageModal()}
                            icon={<Trash2 className="w-4 h-4 text-rose-400" />}
                        >
                            Log Damage / Loss
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => openAdjustModal()}
                            icon={<Sliders className="w-4 h-4" />}
                        >
                            Quick Stock Adjust
                        </Button>
                    </div>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Stock Valuation */}
                    <div className="bg-navy-900/70 border border-gold-500/20 rounded-xl p-4 sm:p-5 backdrop-blur-sm shadow-xs hover:border-gold-500/40 transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</span>
                            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-100 mt-2 font-mono">
                            {formatCurrency(metrics.total_valuation)}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Across <strong className="text-gold-400 font-mono">{metrics.total_stock_units || 0}</strong> total units in warehouse
                        </span>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-navy-900/70 border border-amber-500/30 rounded-xl p-4 sm:p-5 backdrop-blur-sm shadow-xs hover:border-amber-500/50 transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Low Stock Urgency</span>
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
                            {metrics.low_stock_count || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            SKUs at or below threshold
                        </span>
                    </div>

                    {/* Out of Stock Items */}
                    <div className="bg-navy-900/70 border border-rose-500/30 rounded-xl p-4 sm:p-5 backdrop-blur-sm shadow-xs hover:border-rose-500/50 transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Out of Stock (Zero)</span>
                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
                            {metrics.out_of_stock_count || 0}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            Immediate PO replenishment required
                        </span>
                    </div>

                    {/* Damaged Stock Loss */}
                    <div className="bg-navy-900/70 border border-purple-500/30 rounded-xl p-4 sm:p-5 backdrop-blur-sm shadow-xs hover:border-purple-500/50 transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Total Damage Loss</span>
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                <TrendingDown className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-purple-400 mt-2 font-mono">
                            {formatCurrency(metrics.total_damage_loss)}
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                            <strong className="text-purple-300 font-mono">{metrics.damaged_units_total || 0}</strong> damaged units written off
                        </span>
                    </div>
                </div>

                {/* Tab Navigation Navigation Strip */}
                <div className="border-b border-slate-700/60 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('overview');
                            applyFilters('overview');
                        }}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'overview'
                                ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Boxes className="w-4 h-4" />
                        <span>Stock Overview & Urgency Alerts</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('ledger');
                            applyFilters('ledger');
                        }}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'ledger'
                                ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        <span>Inventory Movement Ledger</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('damage');
                            applyFilters('damage');
                        }}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'damage'
                                ? 'border-gold-500 text-gold-400 bg-gold-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Damage & Loss Logs</span>
                    </button>
                </div>

                {/* TAB 1: Stock Overview & Alerts */}
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        {/* Filters Toolbar */}
                        <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search product name or SKU..."
                                        className="w-full pl-9 pr-3 py-2 bg-navy-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" size="sm">Search</Button>
                            </form>

                            <div className="flex flex-wrap items-center gap-3">
                                <FormSelect
                                    label=""
                                    value={stockStatusFilter}
                                    onChange={(e) => {
                                        setStockStatusFilter(e.target.value);
                                        router.get('/admin/inventory', {
                                            active_tab: 'overview',
                                            search: searchQuery,
                                            stock_status: e.target.value,
                                            category_id: categoryFilter,
                                        }, { preserveState: true, replace: true });
                                    }}
                                    className="w-44 text-sm"
                                    options={[
                                        { label: 'All Stock Levels', value: 'all' },
                                        { label: 'Low Stock Only', value: 'low_stock' },
                                        { label: 'Out of Stock Only', value: 'out_of_stock' },
                                        { label: 'In Stock Only', value: 'in_stock' },
                                    ]}
                                />

                                <FormSelect
                                    label=""
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        router.get('/admin/inventory', {
                                            active_tab: 'overview',
                                            search: searchQuery,
                                            stock_status: stockStatusFilter,
                                            category_id: e.target.value,
                                        }, { preserveState: true, replace: true });
                                    }}
                                    className="w-48 text-sm"
                                    options={[
                                        { label: 'All Categories', value: 'all' },
                                        ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Stock Summary Data Table */}
                        <DataTable
                            columns={stockColumns}
                            data={stockSummary.data || []}
                            searchable={false}
                            emptyMessage="No products matching inventory criteria."
                            pagination={stockSummary}
                        />
                    </div>
                )}

                {/* TAB 2: Movement Ledger Audit Trail */}
                {activeTab === 'ledger' && (
                    <div className="space-y-4">
                        {/* Ledger Filters Toolbar */}
                        <div className="bg-navy-900/80 border border-gold-500/20 rounded-xl p-4 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search movements by reason, notes..."
                                        className="w-full pl-9 pr-3 py-2 bg-navy-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" size="sm">Search</Button>
                            </form>

                            <div className="flex items-center gap-3">
                                <FormSelect
                                    label=""
                                    value={movementTypeFilter}
                                    onChange={(e) => {
                                        setMovementTypeFilter(e.target.value);
                                        router.get('/admin/inventory', {
                                            active_tab: 'ledger',
                                            search: searchQuery,
                                            type: e.target.value,
                                        }, { preserveState: true, replace: true });
                                    }}
                                    className="w-48 text-sm"
                                    options={[
                                        { label: 'All Movement Types', value: 'all' },
                                        { label: 'PO Stock-In', value: 'purchase_in' },
                                        { label: 'Stock Increase', value: 'adjustment_increase' },
                                        { label: 'Stock Decrease', value: 'adjustment_decrease' },
                                        { label: 'Damage Loss', value: 'damage_loss' },
                                        { label: 'Order Out', value: 'order_out' },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Movement Ledger Data Table */}
                        <DataTable
                            columns={ledgerColumns}
                            data={ledger.data || []}
                            searchable={false}
                            emptyMessage="No stock movements recorded yet. Movements are generated automatically from POs, adjustments, or damage logs."
                            pagination={ledger}
                        />
                    </div>
                )}

                {/* TAB 3: Damage & Loss Logs */}
                {activeTab === 'damage' && (
                    <div className="space-y-4">
                        <DataTable
                            columns={damageColumns}
                            data={damageLogs.data || []}
                            searchable={false}
                            emptyMessage="No damage loss records found. Click 'Log Damage / Loss' to record damaged stock write-offs."
                            pagination={damageLogs}
                        />
                    </div>
                )}
            </div>

            {/* Quick Stock Adjustment Modal */}
            <Modal
                isOpen={isAdjustModalOpen}
                onClose={() => setIsAdjustModalOpen(false)}
                title="Manual Stock Adjustment"
                maxWidth="md"
            >
                <form onSubmit={handleAdjustSubmit} className="space-y-4">
                    <FormSelect
                        label="Product"
                        required
                        value={adjustProductId}
                        onChange={(e) => {
                            setAdjustProductId(e.target.value);
                            setAdjustVariantId('');
                        }}
                        options={products.map((p) => ({
                            label: `${p.name} (${p.sku}) — Stock: ${p.stock_quantity}`,
                            value: String(p.id),
                        }))}
                    />

                    {selectedAdjustVariants.length > 0 && (
                        <FormSelect
                            label="Specific Variant"
                            value={adjustVariantId}
                            onChange={(e) => setAdjustVariantId(e.target.value)}
                            options={[
                                { label: 'Parent Product Overall', value: '' },
                                ...selectedAdjustVariants.map((v) => ({
                                    label: `${v.size || ''} ${v.color || ''} (${v.sku}) — Stock: ${v.stock_quantity}`,
                                    value: String(v.id),
                                })),
                            ]}
                        />
                    )}

                    <div className="p-3 bg-navy-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-slate-400">Current Warehouse Stock:</span>
                        <span className="font-mono text-base font-bold text-gold-400">
                            {selectedAdjustCurrentStock} units
                        </span>
                    </div>

                    <FormSelect
                        label="Adjustment Action"
                        required
                        value={adjustAction}
                        onChange={(e) => setAdjustAction(e.target.value)}
                        options={[
                            { label: 'Add Stock (Increase +)', value: 'increase' },
                            { label: 'Deduct Stock (Decrease -)', value: 'decrease' },
                            { label: 'Set Exact Count (Cycle Count Override =)', value: 'set_exact' },
                        ]}
                    />

                    <FormInput
                        label={adjustAction === 'set_exact' ? 'Exact Stock Count' : 'Quantity to Adjust'}
                        type="number"
                        min={adjustAction === 'set_exact' ? 0 : 1}
                        required
                        value={adjustQuantity}
                        onChange={(e) => setAdjustQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    />

                    <div className="p-2.5 bg-navy-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-slate-400">Resulting Stock:</span>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                            {adjustAction === 'increase'
                                ? selectedAdjustCurrentStock + Number(adjustQuantity)
                                : adjustAction === 'decrease'
                                ? Math.max(0, selectedAdjustCurrentStock - Number(adjustQuantity))
                                : Number(adjustQuantity)}{' '}
                            units
                        </span>
                    </div>

                    <FormSelect
                        label="Audit Reason"
                        required
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        options={[
                            { label: 'Cycle count audit discrepancy', value: 'Cycle count audit discrepancy' },
                            { label: 'Vendor return correction', value: 'Vendor return correction' },
                            { label: 'Found uncounted stock in warehouse', value: 'Found uncounted stock in warehouse' },
                            { label: 'Internal display or photo shoot sample', value: 'Internal display or photo shoot sample' },
                            { label: 'Stock recalibration after order cancellation', value: 'Stock recalibration after order cancellation' },
                        ]}
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            value={adjustNotes}
                            onChange={(e) => setAdjustNotes(e.target.value)}
                            placeholder="Provide audit reference or batch details..."
                            rows={2}
                            className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsAdjustModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={adjustProcessing}
                        >
                            Apply Adjustment
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Log Damaged Stock Modal */}
            <Modal
                isOpen={isDamageModalOpen}
                onClose={() => setIsDamageModalOpen(false)}
                title="Log Damaged Stock Write-Off"
                maxWidth="md"
            >
                <form onSubmit={handleDamageSubmit} className="space-y-4">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Financial Write-Off Notice:</strong>
                            <p className="mt-0.5 text-slate-300">
                                Logging damaged stock will immediately reduce warehouse inventory and post a financial loss to inventory accounting.
                            </p>
                        </div>
                    </div>

                    <FormSelect
                        label="Product"
                        required
                        value={damageProductId}
                        onChange={(e) => {
                            setDamageProductId(e.target.value);
                            setDamageVariantId('');
                        }}
                        options={products.map((p) => ({
                            label: `${p.name} (${p.sku}) — Available: ${p.stock_quantity}`,
                            value: String(p.id),
                        }))}
                    />

                    {selectedDamageVariants.length > 0 && (
                        <FormSelect
                            label="Specific Variant"
                            value={damageVariantId}
                            onChange={(e) => setDamageVariantId(e.target.value)}
                            options={[
                                { label: 'Parent Product Overall', value: '' },
                                ...selectedDamageVariants.map((v) => ({
                                    label: `${v.size || ''} ${v.color || ''} (${v.sku}) — Available: ${v.stock_quantity}`,
                                    value: String(v.id),
                                })),
                            ]}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <FormInput
                            label="Damaged Quantity"
                            type="number"
                            min={1}
                            max={Math.max(1, selectedDamageCurrentStock)}
                            required
                            value={damageQuantity}
                            onChange={(e) => setDamageQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Est. Loss Write-Off
                            </label>
                            <div className="h-10 px-3 flex items-center bg-navy-950 border border-slate-800 rounded-lg text-rose-400 font-mono font-bold text-sm">
                                {formatCurrency((selectedDamageProduct?.cost_price || 0) * damageQuantity)}
                            </div>
                        </div>
                    </div>

                    <FormSelect
                        label="Damage Reason / Cause"
                        required
                        value={damageReason}
                        onChange={(e) => setDamageReason(e.target.value)}
                        options={[
                            { label: 'Damaged in transit / logistics', value: 'transit_damage' },
                            { label: 'Broken hardware / zipper / stitching', value: 'broken_hardware' },
                            { label: 'Stained or defective fabric', value: 'stained_defective' },
                            { label: 'Water or humidity storage leak', value: 'water_leakage' },
                            { label: 'Expired / quality check reject', value: 'quality_reject' },
                            { label: 'Theft or unexplained shrinkage', value: 'theft_shrinkage' },
                        ]}
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Audit Description
                        </label>
                        <textarea
                            value={damageNotes}
                            onChange={(e) => setDamageNotes(e.target.value)}
                            placeholder="Describe how damage occurred, packaging conditions, or disposal steps..."
                            rows={2}
                            className="w-full bg-navy-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDamageModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            loading={damageProcessing}
                        >
                            Confirm Write-Off
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Update Threshold Modal */}
            <Modal
                isOpen={Boolean(thresholdProduct)}
                onClose={() => setThresholdProduct(null)}
                title={`Low Stock Threshold: ${thresholdProduct?.name || ''}`}
                maxWidth="sm"
            >
                <form onSubmit={handleThresholdSubmit} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        When warehouse stock drops at or below this threshold, an urgency alert will be raised on the dashboard.
                    </p>

                    <FormInput
                        label="Alert Threshold Count"
                        type="number"
                        min={0}
                        required
                        value={newThreshold}
                        onChange={(e) => setNewThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                    />

                    <div className="pt-2 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setThresholdProduct(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={thresholdProcessing}
                        >
                            Save Threshold
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
