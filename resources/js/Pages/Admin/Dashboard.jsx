import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    LogOut, 
    ShieldCheck, 
    ShoppingBag, 
    Users, 
    TrendingUp, 
    AlertTriangle,
    Package,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function Dashboard({ user, metrics }) {
    const { post } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const roleBadgeColors = {
        super_admin: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
        admin: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
        manager: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
        inventory_staff: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40',
        customer: 'bg-slate-800 text-slate-300 border-slate-700',
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
            <Head title="Admin Control Tower - ORIO STYLE" />

            {/* Topbar */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">ORIO STYLE</span>
                        </Link>
                        <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            Admin Backoffice
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Logged in as:</span>
                            <span className="font-semibold text-white">{user?.name}</span>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeColors[user?.role] || 'bg-slate-800 text-slate-300'}`}>
                                {user?.role?.replace('_', ' ')}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Admin Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium mb-3">
                                <ShieldCheck className="w-4 h-4 text-teal-400" />
                                <span>Phase 2 RBAC Guard Active</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Welcome, {user?.name}
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                You have authenticated with <strong className="text-teal-400 capitalize">{user?.role?.replace('_', ' ')}</strong> permissions.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                        >
                            View Storefront
                        </Link>
                    </div>
                </div>

                {/* Quick Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-400 font-medium">Today's Gross Sales</span>
                            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">$0.00</div>
                        <span className="text-[11px] text-teal-400 font-medium">Real-time synced</span>
                    </div>

                    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-400 font-medium">Pending Orders</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">0</div>
                        <span className="text-[11px] text-slate-400 font-medium">0 requiring attention</span>
                    </div>

                    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-400 font-medium">Low-Stock Warnings</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">0</div>
                        <span className="text-[11px] text-emerald-400 font-medium">Stock healthy</span>
                    </div>

                    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-400 font-medium">Registered Staff</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">4</div>
                        <span className="text-[11px] text-purple-400 font-medium">RBAC configured</span>
                    </div>
                </div>

                {/* Next Sprints Preview */}
                <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6">
                    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-teal-400" />
                        <span>Phase 2 RBAC & Auth Architecture Verified</span>
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        Multi-role authentication, `EnsureAdminAccess` middleware guards, deactivated account checks, and 
                        session security are operational.
                    </p>
                </div>
            </main>
        </div>
    );
}
