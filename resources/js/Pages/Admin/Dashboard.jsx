import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Common/Badge';
import Button from '@/Components/Common/Button';
import { 
    TrendingUp, 
    ShoppingBag, 
    AlertTriangle, 
    Users, 
    ShieldCheck, 
    Sparkles, 
    Package,
    FolderTree,
    ArrowRight,
    ArrowUpRight,
    Tag,
    Boxes,
    Settings,
    Truck
} from 'lucide-react';

export default function Dashboard({ user, metrics }) {
    const { settings } = usePage().props;
    const currency = settings?.currency_symbol || '৳';

    const metricCards = [
        {
            title: "Today's Gross Sales",
            value: `${currency}0.00`,
            growth: '+0.0% MoM',
            subText: 'Immutable COGS tracked',
            icon: TrendingUp,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 border-teal-200 dark:bg-teal-500/10 dark:border-teal-500/20',
        },
        {
            title: 'Pending Orders',
            value: metrics?.pendingOrders || '0',
            growth: '0 New',
            subText: 'Awaiting dispatch confirmation',
            icon: ShoppingBag,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20',
        },
        {
            title: 'Low-Stock Warnings',
            value: metrics?.lowStockItems || '0',
            growth: 'Healthy',
            subText: 'Units below safety threshold',
            icon: AlertTriangle,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20',
        },
        {
            title: 'Active Staff & Admins',
            value: '2',
            growth: 'RBAC Active',
            subText: 'Super Admin & Store Admin',
            icon: Users,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20',
        },
    ];

    const quickActions = [
        {
            name: 'Categories Hierarchy',
            desc: 'Configure parent-child taxonomies and live slugs',
            href: '/admin/categories',
            icon: FolderTree,
            phase: 'Phase 4',
            badge: 'Next Sprint',
            color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-500/30',
        },
        {
            name: 'Brands & WebP Hub',
            desc: 'Upload brand logos with automated WebP conversion',
            href: '/admin/brands',
            icon: Tag,
            phase: 'Phase 5',
            badge: 'Planned',
            color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-500/30',
        },
        {
            name: 'Products & Matrix Builder',
            desc: 'Single products & Cartesian variant SKU matrix',
            href: '/admin/products',
            icon: Package,
            phase: 'Phase 6-7',
            badge: 'Planned',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-500/30',
        },
        {
            name: 'Dynamic Settings CMS',
            desc: 'Zero hardcoded brand info, phones, currency & VAT',
            href: '/admin/settings',
            icon: Settings,
            phase: 'Phase 20',
            badge: 'CMS Engine',
            color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-500/30',
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Top Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10 dark:from-teal-950/60 dark:via-slate-900 dark:to-slate-900 border border-teal-200 dark:border-teal-500/30 p-6 sm:p-8 mb-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/20 border border-teal-300 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-bold mb-3 shadow-2xs">
                            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>Phase 3: High-Contrast Admin Shell Kit Active</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            System status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Healthy & Online</span> • Connected to <strong className="text-slate-900 dark:text-white">{settings?.site_name || 'ORIO STYLE'}</strong> Control Tower.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/settings">
                            <Button variant="secondary" size="sm">
                                Configure CMS
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="primary" size="sm" icon={ArrowUpRight}>
                                View Storefront
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
                            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-teal-500/40 dark:hover:border-slate-700 transition duration-200"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {card.title}
                                </span>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${card.bg}`}>
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                                {card.value}
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{card.subText}</span>
                                <span className="font-bold text-teal-600 dark:text-teal-400">{card.growth}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Access & Upcoming Modules */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6 gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            <span>Executive Modules & Sprint Progress</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">20-Phase Master Blueprint Development Matrix</p>
                    </div>
                    <Badge variant="info" size="sm" dot>Sprint 1 Active</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-teal-500/50 hover:shadow-sm transition-all duration-150 group"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-bold font-mono text-teal-700 dark:text-teal-400">{item.phase}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className={`p-2 rounded-lg border ${item.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-teal-700 dark:text-teal-400 font-bold group-hover:text-teal-600 dark:group-hover:text-teal-300 transition">
                                    <span>Enter Module</span>
                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
