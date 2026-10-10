import React, { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import {
    Boxes,
    ArrowLeft,
    Plus,
    Trash2,
    Building2,
    Calendar,
    FileText,
    Calculator,
    Package,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function PurchaseOrderCreate({
    suppliers = [],
    products = [],
    purchaseOrder = null,
    suggestedPoNumber = '',
    isEdit = false,
}) {
    // Initial line items
    const initialItems = isEdit && purchaseOrder?.items?.length > 0
        ? purchaseOrder.items.map((item) => ({
            product_id: String(item.product_id),
            product_variant_id: item.product_variant_id ? String(item.product_variant_id) : '',
            quantity_ordered: item.quantity_ordered || 1,
            unit_cost: item.unit_cost || 0,
            notes: item.notes || '',
        }))
        : [
            {
                product_id: products[0]?.id ? String(products[0].id) : '',
                product_variant_id: '',
                quantity_ordered: 1,
                unit_cost: products[0]?.cost_price || 0,
                notes: '',
            },
        ];

    const { data, setData, post, put, processing, errors } = useForm({
        po_number: purchaseOrder?.po_number || suggestedPoNumber,
        supplier_id: purchaseOrder?.supplier_id ? String(purchaseOrder.supplier_id) : (suppliers[0]?.id ? String(suppliers[0].id) : ''),
        status: purchaseOrder?.status || 'draft',
        order_date: purchaseOrder?.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: purchaseOrder?.expected_delivery_date || '',
        shipping_cost: purchaseOrder?.shipping_cost || '0.00',
        tax_amount: purchaseOrder?.tax_amount || '0.00',
        discount_amount: purchaseOrder?.discount_amount || '0.00',
        notes: purchaseOrder?.notes || '',
        items: initialItems,
    });

    // Helper map of products by ID
    const productMap = useMemo(() => {
        const map = {};
        products.forEach((p) => {
            map[String(p.id)] = p;
        });
        return map;
    }, [products]);

    // Handle line item changes
    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };

        // If product changed, update default unit cost and reset variant
        if (field === 'product_id') {
            const prod = productMap[String(value)];
            if (prod) {
                updated[index].unit_cost = prod.cost_price || 0;
                updated[index].product_variant_id = '';
            }
        }

        setData('items', updated);
    };

    const addItem = () => {
        const defaultProd = products[0];
        setData('items', [
            ...data.items,
            {
                product_id: defaultProd ? String(defaultProd.id) : '',
                product_variant_id: '',
                quantity_ordered: 1,
                unit_cost: defaultProd?.cost_price || 0,
                notes: '',
            },
        ]);
    };

    const removeItem = (index) => {
        if (data.items.length <= 1) return;
        setData('items', data.items.filter((_, i) => i !== index));
    };

    // Calculate subtotal and grand total dynamically
    const itemsSubtotal = useMemo(() => {
        return data.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity_ordered) || 0;
            const cost = parseFloat(item.unit_cost) || 0;
            return sum + qty * cost;
        }, 0);
    }, [data.items]);

    const grandTotal = useMemo(() => {
        const shipping = parseFloat(data.shipping_cost) || 0;
        const tax = parseFloat(data.tax_amount) || 0;
        const discount = parseFloat(data.discount_amount) || 0;
        return Math.max(0, itemsSubtotal + shipping + tax - discount);
    }, [itemsSubtotal, data.shipping_cost, data.tax_amount, data.discount_amount]);

    const formatCurrency = (val) => {
        return '৳' + Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleSubmit = (e, statusToSubmit = data.status) => {
        e.preventDefault();
        const payload = { ...data, status: statusToSubmit };

        if (isEdit && purchaseOrder) {
            put(route('admin.purchase-orders.update', purchaseOrder.id));
        } else {
            post(route('admin.purchase-orders.store'));
        }
    };

    const selectedSupplier = suppliers.find((s) => String(s.id) === String(data.supplier_id));

    return (
        <AdminLayout title={isEdit ? `Edit PO: ${purchaseOrder?.po_number}` : 'New Stock-In Purchase Order'}>
            <Head title={isEdit ? `Edit PO ${purchaseOrder?.po_number}` : 'Create Purchase Order'} />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.purchase-orders.index')}
                            className="p-2 rounded-lg bg-navy-900 border border-gold-500/20 text-slate-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                <Boxes className="w-6 h-6 text-gold-400" />
                                {isEdit ? `Edit Purchase Order: ${purchaseOrder?.po_number}` : 'New Stock-In Purchase Order'}
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Select products, specify vendor costs, and generate order for inventory stock-in.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={(e) => handleSubmit(e, data.status)} className="space-y-6">
                    {/* General PO Information Card */}
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Vendor & Order Details
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormInput
                                label="PO Number"
                                required
                                value={data.po_number}
                                onChange={(e) => setData('po_number', e.target.value)}
                                error={errors.po_number}
                                placeholder="e.g. PO-2026-0001"
                            />

                            <FormSelect
                                label="Supplier / Vendor"
                                required
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value)}
                                error={errors.supplier_id}
                                options={suppliers.map((s) => ({
                                    label: s.company_name ? `${s.name} (${s.company_name})` : s.name,
                                    value: String(s.id),
                                }))}
                            />

                            <FormInput
                                label="Order Date"
                                type="date"
                                required
                                value={data.order_date}
                                onChange={(e) => setData('order_date', e.target.value)}
                                error={errors.order_date}
                            />

                            <FormInput
                                label="Expected Delivery Date"
                                type="date"
                                value={data.expected_delivery_date}
                                onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                error={errors.expected_delivery_date}
                            />
                        </div>

                        {selectedSupplier && (
                            <div className="p-3 bg-navy-950/70 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                                <div>
                                    <span className="text-slate-400">Vendor Entity: </span>
                                    <strong className="text-slate-100">{selectedSupplier.company_name || selectedSupplier.name}</strong>
                                    <span className="text-slate-500 mx-2">|</span>
                                    <span className="text-slate-400">Phone: </span>
                                    <strong className="text-slate-200">{selectedSupplier.phone}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400">Current Payable Balance: </span>
                                    <strong className="text-rose-400 font-mono text-sm">{formatCurrency(selectedSupplier.current_balance)}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Line Items Card */}
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-gold-400 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Line Items ({data.items.length})
                            </h2>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={addItem}
                                icon={<Plus className="w-4 h-4" />}
                            >
                                Add Product Item
                            </Button>
                        </div>

                        {errors.items && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
                                {errors.items}
                            </div>
                        )}

                        <div className="space-y-3">
                            {data.items.map((item, idx) => {
                                const selectedProd = productMap[String(item.product_id)];
                                const variants = selectedProd?.variants || [];
                                const lineSubtotal = (parseFloat(item.quantity_ordered) || 0) * (parseFloat(item.unit_cost) || 0);

                                return (
                                    <div
                                        key={idx}
                                        className="p-4 bg-navy-950/70 border border-slate-800 hover:border-gold-500/30 rounded-xl transition-colors space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Item #{idx + 1}
                                            </span>

                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                                            {/* Product Picker */}
                                            <div className="lg:col-span-4">
                                                <FormSelect
                                                    label="Product"
                                                    required
                                                    value={item.product_id}
                                                    onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                                    options={products.map((p) => ({
                                                        label: `${p.name} (Stock: ${p.stock_quantity})`,
                                                        value: String(p.id),
                                                    }))}
                                                />
                                            </div>

                                            {/* Variant Picker (if product has variants) */}
                                            <div className="lg:col-span-3">
                                                {variants.length > 0 ? (
                                                    <FormSelect
                                                        label="Variant (Size / Color)"
                                                        value={item.product_variant_id}
                                                        onChange={(e) => handleItemChange(idx, 'product_variant_id', e.target.value)}
                                                        options={[
                                                            { label: 'Master / Default Variant', value: '' },
                                                            ...variants.map((v) => ({
                                                                label: `${v.size || ''} ${v.color ? '• ' + v.color : ''} (SKU: ${v.sku})`,
                                                                value: String(v.id),
                                                            })),
                                                        ]}
                                                    />
                                                ) : (
                                                    <div>
                                                        <span className="text-xs text-slate-400 block mb-1">Variant</span>
                                                        <span className="text-xs text-slate-500 py-2 block italic">Single SKU (No Variants)</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity Ordered */}
                                            <div className="lg:col-span-2">
                                                <FormInput
                                                    label="Quantity"
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={item.quantity_ordered}
                                                    onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)}
                                                />
                                            </div>

                                            {/* Unit Cost */}
                                            <div className="lg:col-span-2">
                                                <FormInput
                                                    label="Unit Cost (৳)"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    value={item.unit_cost}
                                                    onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                                                />
                                            </div>

                                            {/* Line Subtotal Preview */}
                                            <div className="lg:col-span-1 text-right pb-2">
                                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Subtotal</span>
                                                <span className="font-mono text-sm font-bold text-emerald-400 block">
                                                    {formatCurrency(lineSubtotal)}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedProd && (
                                            <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                                <span>Current Master Stock: <strong className="text-slate-200">{selectedProd.stock_quantity}</strong> units</span>
                                                <span>Current COGS: <strong className="text-slate-200">{formatCurrency(selectedProd.cost_price)}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Financial Summary & Submission Strip */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Notes */}
                        <div className="lg:col-span-2 bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gold-400" />
                                Order Notes & Instructions
                            </h2>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Add shipping instructions, procurement terms, or vendor references..."
                                rows={4}
                                className="w-full p-3 bg-navy-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                            />
                        </div>

                        {/* Cost Totals Card */}
                        <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-3">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-gold-400" />
                                Order Cost Summary
                            </h2>

                            <div className="space-y-2 text-sm pt-2">
                                <div className="flex justify-between text-slate-300">
                                    <span>Items Subtotal:</span>
                                    <span className="font-mono font-bold text-slate-100">{formatCurrency(itemsSubtotal)}</span>
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Shipping / Freight (৳):</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.shipping_cost}
                                        onChange={(e) => setData('shipping_cost', e.target.value)}
                                        className="w-24 text-right px-2 py-1 bg-navy-950 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-gold-500"
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Taxes / Duties (৳):</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.tax_amount}
                                        onChange={(e) => setData('tax_amount', e.target.value)}
                                        className="w-24 text-right px-2 py-1 bg-navy-950 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-gold-500"
                                    />
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Vendor Discount (৳):</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.discount_amount}
                                        onChange={(e) => setData('discount_amount', e.target.value)}
                                        className="w-24 text-right px-2 py-1 bg-navy-950 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-gold-500"
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base">
                                    <span className="font-bold text-slate-200">Grand Total:</span>
                                    <span className="font-mono text-xl font-black text-emerald-400">
                                        {formatCurrency(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="primary"
                                    loading={processing}
                                    onClick={(e) => handleSubmit(e, 'ordered')}
                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                >
                                    {isEdit ? 'Update & Mark Ordered' : 'Save & Mark Ordered'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    loading={processing}
                                    onClick={(e) => handleSubmit(e, 'draft')}
                                >
                                    Save as Draft
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
