import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Common/Badge';
import Button from '@/Components/Common/Button';
import DataTable from '@/Components/Common/DataTable';
import { 
    TrendingUp, 
    ShoppingBag, 
    AlertTriangle, 
    Users, 
    ArrowUpRight, 
    ShieldCheck, 
    Sparkles, 
    Package,
    FolderTree,
    ArrowRight
} from 'lucide-react';

export default function Dashboard({ user, metrics }) {
    const { settings } = usePage().props;
    const currency = settings?.currency_symbol || '৳';

    const metricCards = [
        {
            title: "Today's Gross Sales",
            value: `${currency}0.00`,
            subText: 'Real-time COGS synced',
            icon: TrendingUp,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10 border-teal-500/20',
        },
        {
            title: 'Pending Orders',
            value: metrics?.pendingOrders || '0',
            subText: '0 awaiting confirmation',
            icon: ShoppingBag,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
        },
        {
            title: 'Low-Stock Warnings',
            value: metrics?.lowStockItems || '0',
            subText: 'Warehouse inventory optimal',
            icon: AlertTriangle,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
        },
        {
            title: 'Active Administrators',
            value: '2',
            subText: 'Super Admin & Store Admin',
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20',
        },
    ];

    const upcomingPhases = [
        {
            phase: 'Phase 4',
            title: 'Category Hierarchy Tree',
            desc: 'Self-referencing parent-child categories, live slug generator, tree builder UI.',
            link: '/admin/categories',
            icon: FolderTree,
            status: 'Next Up',
            variant: 'info',
        },
        {
            phase: 'Phase 5',
            title: 'Brand Catalog & WebP Hub',
            desc: 'Automated WebP media converter, dimension optimizer, brand directory.',
            link: '/admin/brands',
            icon: Package,
            status: 'Sprint 1',
            variant: 'purple',
        },
        {
            phase: 'Phase 6',
            title: 'Core Product Catalog',
            desc: 'Product schema, unit cost (COGS), selling price, rich descriptions, stock alerts.',
            link: '/admin/products',
            icon: Package,
            status: 'Sprint 2',
            variant: 'neutral',
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Top Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 p-6 sm:p-8 mb-8 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium mb-3">
                            <ShieldCheck className="w-4 h-4 text-teal-400" />
                            <span>Phase 3: Admin UI & Shell Kit Active</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Operational status: <span className="text-emerald-400 font-semibold">Healthy</span> • Connected to <strong className="text-white">{settings?.site_name || 'ORIO STYLE'}</strong> Control Tower.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/settings">
                            <Button variant="secondary" size="sm">
                                Manage Settings
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="primary" size="sm">
                                View Store
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {metricCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.title}</span>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.bg}`}>
                                    <Icon className={`w-4 h-4 ${card.color}`} />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{card.value}</div>
                            <span className="text-[11px] text-slate-400 font-medium">{card.subText}</span>
                        </div>
                    );
                })}
            </div>

            {/* Next Phases & Architectural Roadmap */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-teal-400" />
                            <span>Upcoming Sprint Modules</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">20-Phase Master Blueprint Development Tracker</p>
                    </div>
                    <Badge variant="info" size="sm">Sprint 1 In Progress</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingPhases.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-teal-500/40 transition group"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-bold font-mono text-teal-400">{item.phase}</span>
                                        <Badge variant={item.variant} size="sm">{item.status}</Badge>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-teal-400" />
                                        <span>{item.title}</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-teal-400 font-semibold group-hover:text-teal-300 transition">
                                    <span>Blueprint Spec</span>
                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
