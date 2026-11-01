import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Printer, ArrowLeft, FileText, Receipt, CheckCircle, ShieldCheck } from 'lucide-react';
import Barcode from '@/Components/Common/Barcode';

export default function OrderInvoice({ order = {} }) {
    const { settings = {} } = usePage().props;
    const [invoiceMode, setInvoiceMode] = useState('a4'); // 'a4' or 'thermal'

    const siteName = settings.site_name || 'ORIO STYLE';
    const legalCompanyName = settings.legal_company_name || 'ORIO STYLE E-Commerce Ltd.';
    const taxBinNumber = settings.tax_bin_number || 'BIN-009823412';
    const storeAddress = settings.store_address || 'House 12, Road 4, Banani, Dhaka - 1213, Bangladesh';
    const supportPhone = settings.support_phone || '+880 1700-000000';
    const supportEmail = settings.support_email || 'support@oriostyle.com';
    const footerNotes = settings.invoice_footer_notes || 'Thank you for shopping with ORIO STYLE! Goods once sold can be exchanged within 07 days with original invoice.';
    const currencySymbol = order.currency_symbol || settings.default_currency_symbol || '৳';

    const formatCurrency = (amount) => {
        return currencySymbol + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handlePrint = () => {
        window.print();
    };

    const isCod = order.payment_method === 'cod';
    const isPaid = order.payment_status === 'paid';

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-800 print:bg-white print:p-0 print:text-black">
            <Head title={`Invoice #${order.order_number} | ${siteName}`} />

            {/* Print Dynamic Page Rules based on Active Mode */}
            <style>{`
                @media print {
                    @page {
                        size: ${invoiceMode === 'thermal' ? '80mm auto' : 'A4'};
                        margin: ${invoiceMode === 'thermal' ? '0mm' : '10mm'};
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                    }
                }
            `}</style>

            {/* Non-Printing Top Controls Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link
                    href={route('admin.orders.show', order.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-xs w-full sm:w-auto justify-center"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Order Details
                </Link>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-300 shadow-xs">
                    <button
                        type="button"
                        onClick={() => setInvoiceMode('a4')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            invoiceMode === 'a4'
                                ? 'bg-[#0E2038] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>A4 Tax Invoice</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setInvoiceMode('thermal')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            invoiceMode === 'thermal'
                                ? 'bg-[#0E2038] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>80mm POS Thermal Slip</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase rounded-xl bg-[#0E2038] text-white hover:bg-[#1C3E63] transition shadow-md w-full sm:w-auto justify-center cursor-pointer"
                >
                    <Printer className="w-4 h-4 text-[#D4AF37]" />
                    <span>Print {invoiceMode === 'thermal' ? '80mm Thermal Receipt' : 'A4 Invoice'}</span>
                </button>
            </div>

            {/* ========================================================================= */}
            {/* MODE 1: STANDARD A4 COMMERCIAL TAX INVOICE */}
            {/* ========================================================================= */}
            {invoiceMode === 'a4' && (
                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm print:border-0 print:shadow-none print:p-4 print:rounded-none">
                    {/* Header: Company Profile + Invoice Status Meta */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
                        <div>
                            {settings.site_logo ? (
                                <img
                                    src={settings.site_logo}
                                    alt={siteName}
                                    className="h-10 w-auto object-contain mb-2 print:h-8"
                                />
                            ) : (
                                <div className="text-2xl font-black tracking-widest text-[#0E2038] uppercase">
                                    {siteName}
                                </div>
                            )}

                            <div className="text-xs font-bold text-slate-700 tracking-wider">
                                {legalCompanyName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                VAT/BIN: <strong>{taxBinNumber}</strong>
                            </div>

                            <div className="text-xs text-slate-600 mt-2 space-y-0.5 leading-relaxed">
                                <p>{storeAddress}</p>
                                <p>Phone: <strong>{supportPhone}</strong> | Email: {supportEmail}</p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right flex flex-col sm:items-end">
                            <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-widest rounded bg-slate-100 text-slate-800 border border-slate-300">
                                COMMERCIAL TAX INVOICE
                            </span>

                            <div className="my-2.5">
                                <Barcode value={order.order_number} height={36} showText={true} />
                            </div>

                            <div className="text-xs text-slate-500">
                                Invoice Date: <strong className="text-slate-800 font-mono">{formatDate(order.created_at)}</strong>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                                Fulfillment: <strong className="uppercase text-slate-800">{order.order_status}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Customer Destination & Billing Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
                        <div>
                            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Bill To & Shipping Destination
                            </span>
                            <div className="font-bold text-sm text-slate-900 mb-1">
                                {order.customer_name}
                            </div>
                            <div className="text-slate-700 leading-relaxed">
                                {order.shipping_address}
                            </div>
                            <div className="text-slate-700 font-semibold mt-1">
                                {order.city} {order.zone ? `(${order.zone})` : ''} {order.postal_code ? `- ${order.postal_code}` : ''}
                            </div>
                            <div className="text-slate-900 font-mono font-bold mt-2">
                                Contact: {order.customer_phone}
                            </div>
                            {order.customer_email && (
                                <div className="text-slate-600">
                                    Email: {order.customer_email}
                                </div>
                            )}
                        </div>

                        <div className="sm:text-right">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Payment & Dispatch Policy
                            </span>
                            <div className="space-y-1.5">
                                <div>
                                    <span className="text-slate-500">Payment Method: </span>
                                    <strong className="uppercase text-slate-900 font-semibold">
                                        {isCod ? 'Cash On Delivery (COD)' : order.payment_method}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-slate-500">Payment Status: </span>
                                    <span className={`inline-block px-2 py-0.5 font-bold uppercase rounded text-[10px] ${
                                        isPaid
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}>
                                        {order.payment_status || 'Unpaid'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Delivery Zone: </span>
                                    <strong className="text-slate-900 font-semibold">{order.city}</strong>
                                </div>
                                {order.customer_notes && (
                                    <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-left text-[11px] text-amber-900">
                                        <strong>Customer Note:</strong> {order.customer_notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="py-6">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase tracking-wider">
                                    <th className="py-2.5 px-2 w-10 text-center">#</th>
                                    <th className="py-2.5 px-3">Item Description</th>
                                    <th className="py-2.5 px-3 text-center">SKU</th>
                                    <th className="py-2.5 px-3 text-center">Qty</th>
                                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                                    <th className="py-2.5 px-3 text-right">Line Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {order.items && order.items.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="py-3 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                                        <td className="py-3 px-3">
                                            <div className="font-bold text-slate-900">{item.product_name}</div>
                                            {item.variant_attributes && (
                                                <div className="text-[11px] text-slate-600 mt-0.5">
                                                    {Object.entries(item.variant_attributes).map(([k, v]) => (
                                                        <span key={k} className="mr-2">
                                                            {k}: <strong className="text-slate-800">{v}</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                                            {item.product_sku || '—'}
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono">
                                            {formatCurrency(item.unit_price)}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                                            {formatCurrency(item.line_total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Subtotals & Grand Total Summary */}
                    <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
                        <div className="max-w-xs text-slate-500">
                            <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                Return & Exchange Policy
                            </span>
                            <p className="leading-relaxed">
                                {footerNotes}
                            </p>
                        </div>

                        <div className="w-full sm:w-72 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-mono font-bold">{formatCurrency(order.subtotal)}</span>
                            </div>

                            {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-emerald-700 font-semibold">
                                    <span>Promotional Discount</span>
                                    <span className="font-mono font-bold">-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-slate-600">
                                <span>Shipping Logistics</span>
                                <span className="font-mono font-bold">
                                    {Number(order.shipping_charge) === 0 ? (
                                        <span className="text-emerald-700">FREE</span>
                                    ) : (
                                        formatCurrency(order.shipping_charge)
                                    )}
                                </span>
                            </div>

                            <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-900">
                                <span>Total Amount Due</span>
                                <span className="font-mono text-base">{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Authorized Signatures */}
                    <div className="mt-14 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                        <div className="text-center">
                            <div className="w-40 border-b border-slate-300 mb-1" />
                            <span>Customer Acknowledgment</span>
                        </div>

                        <div className="text-center">
                            <div className="w-40 border-b border-slate-300 mb-1" />
                            <span>Authorized Dispatch Officer</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-[11px] text-slate-400 mt-8 pt-4 border-t border-slate-100">
                        {siteName} • Customer Care Hotline: {supportPhone} • Generated automatically on {formatDateTime(new Date())}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODE 2: 80MM POS THERMAL RECEIPT / WAREHOUSE PACKING SLIP */}
            {/* ========================================================================= */}
            {invoiceMode === 'thermal' && (
                <div className="max-w-[340px] mx-auto bg-white border border-slate-300 rounded-lg p-5 shadow-sm font-mono text-[11px] text-black print:border-0 print:shadow-none print:p-2 print:m-0 print:w-[80mm] print:max-w-[80mm]">
                    {/* Thermal Header */}
                    <div className="text-center pb-3 border-b border-dashed border-black">
                        <h2 className="text-sm font-black uppercase tracking-wider mb-0.5">
                            {siteName}
                        </h2>
                        <div className="text-[10px] text-slate-600">
                            {storeAddress}
                        </div>
                        <div className="text-[10px] text-slate-600">
                            BIN: {taxBinNumber} | Tel: {supportPhone}
                        </div>
                    </div>

                    {/* Order Reference & Barcode */}
                    <div className="text-center py-3 border-b border-dashed border-black">
                        <div className="text-[10px] uppercase font-bold text-slate-600 mb-1">
                            Warehouse Packing Slip
                        </div>
                        <div className="my-1.5 flex justify-center">
                            <Barcode value={order.order_number} height={32} showText={true} />
                        </div>
                        <div className="text-[10px] mt-1 text-slate-600">
                            Date: {formatDateTime(order.created_at)}
                        </div>
                    </div>

                    {/* Customer Destination Info */}
                    <div className="py-2.5 border-b border-dashed border-black text-[10px] leading-tight space-y-1">
                        <div>
                            <strong>RECIPIENT:</strong> {order.customer_name}
                        </div>
                        <div>
                            <strong>PHONE:</strong> {order.customer_phone}
                        </div>
                        <div>
                            <strong>ADDRESS:</strong> {order.shipping_address}, {order.city}
                        </div>
                        {order.customer_notes && (
                            <div className="text-slate-700 italic">
                                Note: {order.customer_notes}
                            </div>
                        )}
                    </div>

                    {/* Compact Items List */}
                    <div className="py-2.5 border-b border-dashed border-black">
                        <div className="flex justify-between font-bold text-[10px] uppercase pb-1 border-b border-black">
                            <span>Item [SKU]</span>
                            <span>Qty x Total</span>
                        </div>
                        <div className="divide-y divide-dotted divide-slate-300 mt-1">
                            {order.items && order.items.map((item) => (
                                <div key={item.id} className="py-1.5 text-[10px]">
                                    <div className="font-bold leading-tight">
                                        {item.product_name}
                                    </div>
                                    <div className="text-[9px] text-slate-600">
                                        {item.product_sku ? `[${item.product_sku}] ` : ''}
                                        {item.variant_attributes && (
                                            Object.entries(item.variant_attributes).map(([k, v]) => `${k}:${v}`).join(', ')
                                        )}
                                    </div>
                                    <div className="flex justify-between mt-0.5">
                                        <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                                        <span className="font-bold">{formatCurrency(item.line_total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-slate-700">
                                <span>Discount:</span>
                                <span>-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span>
                                {Number(order.shipping_charge) === 0 ? 'FREE' : formatCurrency(order.shipping_charge)}
                            </span>
                        </div>
                        <div className="flex justify-between font-black text-xs pt-1 border-t border-black">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* High-Visibility Courier Cash Collection Alert */}
                    <div className="my-3 p-2 border-2 border-black text-center font-black">
                        {isPaid ? (
                            <div className="text-xs uppercase">
                                ✓ ORDER FULLY PAID ONLINE
                            </div>
                        ) : (
                            <div className="text-xs uppercase">
                                CASH TO COLLECT: {formatCurrency(order.total_amount)}
                            </div>
                        )}
                    </div>

                    {/* Thermal Footer */}
                    <div className="text-center text-[9px] text-slate-600 space-y-0.5">
                        <p>{footerNotes}</p>
                        <p className="mt-1 font-bold">*** THANK YOU FOR YOUR BUSINESS ***</p>
                    </div>
                </div>
            )}
        </div>
    );
}
