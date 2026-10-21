import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function OrderInvoice({ order = {} }) {
    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-800 print:bg-white print:p-0 print:text-black">
            <Head title={`Invoice ${order.order_number} | ORIO STYLE`} />

            {/* Non-printing Control Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={route('admin.orders.show', order.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Order
                </Link>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase rounded-xl bg-[#0E2038] text-white hover:bg-[#1C3E63] transition shadow-md"
                >
                    <Printer className="w-4 h-4" />
                    Print Commercial Invoice
                </button>
            </div>

            {/* Invoice Sheet */}
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm print:border-0 print:shadow-none print:p-6 print:rounded-none">
                {/* Header / Brand Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
                    <div>
                        <div className="text-2xl font-black tracking-widest text-[#0E2038] uppercase">
                            ORIO STYLE
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                            Elevate Everyday Luxury & Contemporary Fashion
                        </div>
                        <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                            <p>Dhaka, Bangladesh</p>
                            <p>Web: www.oriostyle.com | Hotline: +880 1700-000000</p>
                            <p>Email: support@oriostyle.com</p>
                        </div>
                    </div>

                    <div className="text-left sm:text-right">
                        <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-widest rounded bg-slate-100 text-slate-800 border border-slate-300">
                            COMMERCIAL INVOICE
                        </span>
                        <div className="text-lg font-black font-mono text-[#0E2038] mt-2">
                            {order.order_number}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Date: <strong className="text-slate-800">{formatDate(order.created_at)}</strong>
                        </div>
                        <div className="text-xs text-slate-500">
                            Status: <strong className="uppercase text-slate-800">{order.order_status}</strong>
                        </div>
                    </div>
                </div>

                {/* Bill To / Payment Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
                    <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Bill To & Delivery Destination
                        </span>
                        <div className="font-bold text-sm text-slate-900 mb-1">
                            {order.customer_name}
                        </div>
                        <div className="text-slate-700 leading-relaxed">
                            {order.shipping_address}
                        </div>
                        <div className="text-slate-700 font-semibold mt-1">
                            {order.city} {order.postal_code ? `- ${order.postal_code}` : ''}
                        </div>
                        <div className="text-slate-900 font-mono font-semibold mt-2">
                            Phone: {order.customer_phone}
                        </div>
                        {order.customer_email && (
                            <div className="text-slate-600">
                                Email: {order.customer_email}
                            </div>
                        )}
                    </div>

                    <div className="sm:text-right">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Payment Details
                        </span>
                        <div className="space-y-1">
                            <div>
                                <span className="text-slate-500">Method: </span>
                                <strong className="uppercase text-slate-900">
                                    {order.payment_method === 'cod' ? 'Cash On Delivery (COD)' : order.payment_method}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Payment Status: </span>
                                <strong className={`uppercase ${order.payment_status === 'paid' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {order.payment_status || 'Unpaid'}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-500">Currency: </span>
                                <strong className="text-slate-900">{order.currency || 'BDT'}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="py-6">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase tracking-wider">
                                <th className="py-2.5 px-2 w-12 text-center">#</th>
                                <th className="py-2.5 px-3">Item Description</th>
                                <th className="py-2.5 px-3 text-center">SKU</th>
                                <th className="py-2.5 px-3 text-center">Qty</th>
                                <th className="py-2.5 px-3 text-right">Unit Price</th>
                                <th className="py-2.5 px-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {order.items && order.items.map((item, idx) => (
                                <tr key={item.id}>
                                    <td className="py-3 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                        <div className="font-bold text-slate-900">{item.product_name}</div>
                                        {item.formatted_variant && (
                                            <div className="text-[11px] text-slate-600 mt-0.5">
                                                {item.formatted_variant}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                                        {item.product_sku || '—'}
                                    </td>
                                    <td className="py-3 px-3 text-center font-bold">
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

                {/* Subtotals & Grand Total */}
                <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6 text-xs">
                    <div className="max-w-xs text-slate-500">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                            Terms & Conditions
                        </span>
                        <p className="leading-relaxed">
                            Goods sold are eligible for 07-day exchange in original unwashed condition with tags attached. Please present this invoice for warranty and returns.
                        </p>
                    </div>

                    <div className="w-full sm:w-72 space-y-2">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-mono font-bold">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Shipping / Courier Fee</span>
                            <span className="font-mono font-bold">{formatCurrency(order.shipping_charge)}</span>
                        </div>
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-emerald-700">
                                <span>Discount</span>
                                <span className="font-mono font-bold">-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-900">
                            <span>Total Due</span>
                            <span className="font-mono text-base">{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Signatures & Footer Note */}
                <div className="mt-14 pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                    <div className="text-center">
                        <div className="w-40 border-b border-slate-300 mb-1" />
                        <span>Customer Signature</span>
                    </div>

                    <div className="text-center">
                        <div className="w-40 border-b border-slate-300 mb-1" />
                        <span>Authorized Officer</span>
                    </div>
                </div>

                <div className="text-center text-[11px] text-slate-400 mt-8 pt-4 border-t border-slate-100">
                    Thank you for shopping with ORIO STYLE. We appreciate your patronage!
                </div>
            </div>
        </div>
    );
}
