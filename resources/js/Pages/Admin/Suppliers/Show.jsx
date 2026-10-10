import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/Common/Button';
import Badge from '@/Components/Common/Badge';
import FormInput from '@/Components/Common/FormInput';
import FormSelect from '@/Components/Common/FormSelect';
import Modal from '@/Components/Common/Modal';
import DataTable from '@/Components/Common/DataTable';
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
    Receipt,
    Wallet
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

    const columns = [
        {
            key: 'transaction_date',
            label: 'Date',
            cellClassName: 'whitespace-nowrap',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <div className="flex items-center gap-1.5 text-slate-200 font-mono text-xs font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-gold-400" />
                        <span>{item.transaction_date}</span>
                    </div>
                );
            },
        },
        {
            key: 'transaction_type',
            label: 'Type',
            cellClassName: 'whitespace-nowrap',
            render: (val, row) => {
                const item = row || val || {};
                if (item.transaction_type === 'payment') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ArrowDownLeft className="w-3 h-3" /> Payment (Debit)
                        </span>
                    );
                }
                if (item.transaction_type === 'purchase' || item.transaction_type === 'bill') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <ArrowUpRight className="w-3 h-3" /> Purchase (Credit)
                        </span>
                    );
                }
                if (item.transaction_type === 'opening_balance') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Opening Balance
                        </span>
                    );
                }
                return (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-700/50 text-slate-300">
                        {item.transaction_type}
                    </span>
                );
            },
        },
        {
            key: 'reference_no',
            label: 'Reference #',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="font-mono text-xs text-slate-300 font-bold">
                        {item.reference_no || '—'}
                    </span>
                );
            },
        },
        {
            key: 'payment_method',
            label: 'Method',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="text-xs text-slate-400 capitalize">
                        {item.payment_method ? item.payment_method.replace('_', ' ') : '—'}
                    </span>
                );
            },
        },
        {
            key: 'debit',
            label: 'Paid / Debit',
            className: 'text-right',
            render: (val, row) => {
                const item = row || val || {};
                const debit = Number(item.debit || 0);
                return (
                    <span className="font-mono text-xs font-bold text-emerald-400">
                        {debit > 0 ? formatCurrency(debit) : '—'}
                    </span>
                );
            },
        },
        {
            key: 'credit',
            label: 'Billed / Credit',
            className: 'text-right',
            render: (val, row) => {
                const item = row || val || {};
                const credit = Number(item.credit || 0);
                return (
                    <span className="font-mono text-xs font-bold text-amber-400">
                        {credit > 0 ? formatCurrency(credit) : '—'}
                    </span>
                );
            },
        },
        {
            key: 'balance',
            label: 'Running Balance',
            className: 'text-right',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="font-mono text-xs font-extrabold text-slate-100">
                        {formatCurrency(item.balance)}
                    </span>
                );
            },
        },
        {
            key: 'notes',
            label: 'Notes',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="text-xs text-slate-400 max-w-xs truncate block" title={item.notes}>
                        {item.notes || '—'}
                    </span>
                );
            },
        },
        {
            key: 'creator',
            label: 'Staff',
            render: (val, row) => {
                const item = row || val || {};
                return (
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                        {item.creator?.name || 'System'}
                    </span>
                );
            },
        },
    ];

    const ledgerList = ledger.data || [];

    return (
        <AdminLayout title={`Supplier Statement - ${supplier.name}`}>
            <Head title={`Ledger: ${supplier.name} - Procurement`} />

            <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.suppliers.index')}
                            className="p-2 rounded-lg bg-navy-900 border border-gold-500/20 text-slate-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                            title="Back to Suppliers Directory"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-bold text-slate-100">
                                    {supplier.name}
                                </h1>
                                <Badge variant={supplier.is_active ? 'success' : 'secondary'}>
                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">
                                {supplier.company_name ? `${supplier.company_name} • ` : ''}Running Payable Balance Statement
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={openPaymentModal}
                        variant="primary"
                        icon={<CreditCard className="w-4 h-4" />}
                    >
                        Record Transaction / Payment
                    </Button>
                </div>

                {/* Profile & Financial Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Supplier Profile Info Card */}
                    <div className="bg-navy-900/60 border border-gold-500/20 rounded-xl p-5 backdrop-blur-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Vendor Profile & Contact
                        </h3>

                        <div className="space-y-3 text-sm">
                            {supplier.company_name && (
                                <div className="flex items-start gap-2.5 text-slate-200">
                                    <Building2 className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-bold block">{supplier.company_name}</span>
                                        <span className="text-xs text-slate-400">Enterprise Entity</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2.5 text-slate-200">
                                <Phone className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-mono font-bold block">{supplier.phone}</span>
                                    <span className="text-xs text-slate-400">Primary Contact Phone</span>
                                </div>
                            </div>

                            {supplier.email && (
                                <div className="flex items-start gap-2.5 text-slate-200">
                                    <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-medium block text-slate-300">{supplier.email}</span>
                                        <span className="text-xs text-slate-400">Email Address</span>
                                    </div>
                                </div>
                            )}

                            {(supplier.address || supplier.city) && (
                                <div className="flex items-start gap-2.5 text-slate-200">
                                    <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="block font-medium text-slate-300">
                                            {[supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ')}
                                        </span>
                                        <span className="text-xs text-slate-400">Office Location</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {supplier.notes && (
                            <div className="pt-3 border-t border-slate-700/50">
                                <span className="text-xs text-slate-400 block font-bold mb-1">Notes:</span>
                                <p className="text-xs text-slate-300 italic">{supplier.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Financial Summary & Balance Banner */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-navy-900 via-navy-900 to-navy-950 border border-gold-500/30 rounded-xl p-6 shadow-xl flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Current Outstanding Payable
                                </span>
                                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="my-4">
                                <div className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight font-mono">
                                    {formatCurrency(payable)}
                                </div>
                                <span className="text-xs font-medium text-slate-400 mt-1 block">
                                    {payable > 0
                                        ? 'Amount currently owed to supplier by store'
                                        : 'Account settled (zero outstanding balance)'}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                <span>Initial Opening Balance: <strong className="text-slate-200 font-mono">{formatCurrency(supplier.opening_balance)}</strong></span>
                                <span className="font-bold text-gold-400 flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5" /> Total Records: {ledger.total || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ledger Transactions Statement Table */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gold-400" />
                            Transaction Ledger Statement
                        </h3>
                    </div>

                    <DataTable
                        columns={columns}
                        data={ledgerList}
                        searchable={false}
                        emptyMessage="No ledger transactions posted yet. Click 'Record Transaction / Payment' to post your first entry."
                        pagination={ledger}
                    />
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
                    <div className="p-3.5 rounded-xl bg-navy-950 border border-gold-500/20 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 block font-bold uppercase">Current Payable Balance</span>
                            <span className="text-lg font-black text-rose-400 font-mono">
                                {formatCurrency(payable)}
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
        </AdminLayout>
    );
}
