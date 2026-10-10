import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import {
    ArrowLeft,
    CreditCard,
    Plus,
    FileText,
    Building2,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    UserCheck,
    Receipt
} from 'lucide-react';

export default function SupplierShow({ supplier = {}, ledger = { data: [] } }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Payment Form
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

    const openPaymentModal = () => {
        clearPaymentErrors();
        resetPayment();
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        submitPayment(route('admin.suppliers.record-payment', supplier.id), {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                resetPayment();
            },
        });
    };

    const formatCurrency = (amount) => {
        return '৳' + Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const payable = Number(supplier.current_balance || 0);

    return (
        <AdminLayout title={`Supplier Statement - ${supplier.name}`}>
            <Head title={`Ledger: ${supplier.name} - Procurement`} />

            <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.suppliers.index')}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 text-slate-600 dark:text-slate-300 hover:text-[#D4AF37] transition shadow-xs"
                            title="Back to Suppliers Directory"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-[#0E2038] dark:text-white">
                                    {supplier.name}
                                </h1>
                                {supplier.is_active ? (
                                    <Badge variant="success">Active</Badge>
                                ) : (
                                    <Badge variant="danger">Inactive</Badge>
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {supplier.company_name ? `${supplier.company_name} • ` : ''}Running Payable Balance Statement
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={openPaymentModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Record Transaction / Payment
                        </Button>
                    </div>
                </div>

                {/* Profile & Financial Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Supplier Profile Info Card */}
                    <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Vendor Profile & Contact
                        </h3>

                        <div className="space-y-3 text-sm">
                            {supplier.company_name && (
                                <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200">
                                    <Building2 className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold block">{supplier.company_name}</span>
                                        <span className="text-xs text-slate-400">Enterprise Entity</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200">
                                <Phone className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold block">{supplier.phone}</span>
                                    <span className="text-xs text-slate-400">Primary Phone</span>
                                </div>
                            </div>

                            {supplier.email && (
                                <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200">
                                    <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold block">{supplier.email}</span>
                                        <span className="text-xs text-slate-400">Email Address</span>
                                    </div>
                                </div>
                            )}

                            {(supplier.address || supplier.city) && (
                                <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200">
                                    <MapPin className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="block font-medium">
                                            {[supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ')}
                                        </span>
                                        <span className="text-xs text-slate-400">Office Location</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {supplier.notes && (
                            <div className="pt-3 border-t border-slate-100 dark:border-[#1C3E63]/40">
                                <span className="text-xs text-slate-400 block font-bold mb-1">Notes:</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic">{supplier.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Financial Summary & Balance Banner */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Net Payable Balance Big Card */}
                        <div className="sm:col-span-2 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#0E2038] dark:via-[#0E2038] dark:to-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Current Outstanding Payable
                                </span>
                                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="my-3">
                                <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                                    {formatCurrency(payable)}
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">
                                    {payable > 0
                                        ? 'Amount currently owed to supplier by store'
                                        : 'Account settled (no outstanding balance)'}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-slate-200 dark:border-[#1C3E63]/50 flex items-center justify-between text-xs text-slate-400">
                                <span>Initial Opening Balance: {formatCurrency(supplier.opening_balance)}</span>
                                <span className="font-bold text-[#D4AF37]">Active Running Ledger</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ledger Transactions Timeline Table */}
                <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#D4AF37]" />
                            <h3 className="font-bold text-[#0E2038] dark:text-white text-base">
                                Transaction Ledger History
                            </h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            Total Records: {ledger.total || 0}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-[#071324]/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-[#1C3E63]/70">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Transaction Type</th>
                                    <th className="py-3 px-4">Reference #</th>
                                    <th className="py-3 px-4">Method</th>
                                    <th className="py-3 px-4 text-right">Paid / Debit (৳)</th>
                                    <th className="py-3 px-4 text-right">Billed / Credit (৳)</th>
                                    <th className="py-3 px-4 text-right">Running Balance (৳)</th>
                                    <th className="py-3 px-4">Notes</th>
                                    <th className="py-3 px-4">Staff</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/40 font-medium text-xs">
                                {ledger.data && ledger.data.length > 0 ? (
                                    ledger.data.map((entry) => {
                                        const debit = Number(entry.debit || 0);
                                        const credit = Number(entry.credit || 0);
                                        const balance = Number(entry.balance || 0);

                                        let typeBadge = (
                                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {entry.transaction_type}
                                            </span>
                                        );

                                        if (entry.transaction_type === 'payment') {
                                            typeBadge = (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    Payment (Debit)
                                                </span>
                                            );
                                        } else if (entry.transaction_type === 'purchase' || entry.transaction_type === 'bill') {
                                            typeBadge = (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                    Purchase (Credit)
                                                </span>
                                            );
                                        } else if (entry.transaction_type === 'opening_balance') {
                                            typeBadge = (
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                    Opening Balance
                                                </span>
                                            );
                                        }

                                        return (
                                            <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071324]/30 transition">
                                                <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                                                    {entry.transaction_date}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {typeBadge}
                                                </td>

                                                <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {entry.reference_no || '—'}
                                                </td>

                                                <td className="py-3 px-4 text-slate-500 capitalize">
                                                    {entry.payment_method ? entry.payment_method.replace('_', ' ') : '—'}
                                                </td>

                                                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    {debit > 0 ? formatCurrency(debit) : '—'}
                                                </td>

                                                <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                                                    {credit > 0 ? formatCurrency(credit) : '—'}
                                                </td>

                                                <td className="py-3 px-4 text-right font-mono font-extrabold text-[#0E2038] dark:text-white">
                                                    {formatCurrency(balance)}
                                                </td>

                                                <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={entry.notes}>
                                                    {entry.notes || '—'}
                                                </td>

                                                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                                                    {entry.creator?.name || 'System'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-slate-400">
                                            <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                                            <p className="font-semibold">No ledger transactions posted yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {ledger.links && ledger.links.length > 3 && (
                        <div className="p-4 border-t border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Showing {ledger.from || 0} to {ledger.to || 0} of {ledger.total || 0} entries
                            </span>
                            <div className="flex gap-1">
                                {ledger.links.map((link, idx) => (
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

            {/* Record Payment / Ledger Transaction Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={`Record Transaction: ${supplier.name}`}
                maxWidth="md"
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 block font-bold uppercase">Current Payable Balance</span>
                            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                                {formatCurrency(payable)}
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
        </AdminLayout>
    );
}
