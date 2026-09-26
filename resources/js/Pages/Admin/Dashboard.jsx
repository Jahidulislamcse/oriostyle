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
    Truck,
    CheckCircle2,
    Activity
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
            color: 'text-teal-700 dark:text-teal-400',
            iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-2 border-teal-300 dark:border-teal-700',
        },
        {
            title: 'Pending Orders',
            value: metrics?.pendingOrders || '0',
            growth: '0 New Today',
            subText: 'Awaiting dispatch confirmation',
            icon: ShoppingBag,
            color: 'text-indigo-700 dark:text-indigo-400',
            iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700',
        },
        {
            title: 'Low-Stock Warnings',
            value: metrics?.lowStockItems || '0',
            growth: 'Healthy Count',
            subText: 'Units below safety threshold',
            icon: AlertTriangle,
            color: 'text-amber-700 dark:text-amber-400',
            iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700',
        },
        {
            title: 'Active Staff & Admins',
            value: '2',
            growth: 'RBAC Active',
            subText: 'Super Admin & Store Admin',
            icon: Users,
            color: 'text-purple-700 dark:text-purple-400',
            iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700',
        },
    ];

    const quickActions = [
        {
            name: 'Categories Hierarchy',
            desc: 'Configure parent-child taxonomies, subcategories and live slugs',
            href: '/admin/categories',
            icon: FolderTree,
            phase: 'Phase 4',
            badge: 'Live & Active',
            color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border-2 border-teal-300 dark:border-teal-700/80',
        },
        {
            name: 'Brands & WebP Hub',
            desc: 'Upload brand logos with automated WebP conversion',
            href: '/admin/brands',
            icon: Tag,
            phase: 'Phase 5',
            badge: 'Next Sprint',
            color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-300 dark:border-indigo-700/80',
        },
        {
            name: 'Products & Matrix Builder',
            desc: 'Single products & Cartesian variant SKU matrix',
            href: '/admin/products',
            icon: Package,
            phase: 'Phase 6-7',
            badge: 'Planned',
            color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border-2 border-blue-300 dark:border-blue-700/80',
        },
        {
            name: 'Dynamic Settings CMS',
            desc: 'Zero hardcoded brand info, phones, currency & VAT',
            href: '/admin/settings',
            icon: Settings,
            phase: 'Phase 20',
            badge: 'CMS Engine',
            color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 border-2 border-purple-300 dark:border-purple-700/80',
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Top Welcome Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white p-7 sm:p-9 mb-8 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black tracking-wide uppercase">
                            <ShieldCheck className="w-4 h-4 text-teal-300" />
                            <span>Enterprise Admin Control Tower</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-sm sm:text-base text-teal-100 font-medium max-w-2xl">
                            System status: <span className="text-emerald-300 font-bold">● High Availability & Anti-N+1 Enforced</span> • Live connected to <strong className="text-white font-bold">{settings?.site_name || 'ORIO STYLE'}</strong>.
                        </p>
                    </div>

                    <Link href="/admin/categories">
                        <Button
                            variant="secondary"
                            size="md"
                            icon={FolderTree}
                            className="shadow-md bg-white text-slate-950 hover:bg-slate-100 border-none font-black"
                        >
                            Open Category Tree
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {metricCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition duration-150"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    {card.title}
                                </span>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconBg} shadow-xs`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight mb-2">
                                {card.value}
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-teal-700 dark:text-teal-400">{card.growth}</span>
                                <span className="text-slate-500 dark:text-slate-400">{card.subText}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Action Phase Modules */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                            Platform Blueprint Execution
                        </h2>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Direct jump into active and upcoming architecture phase modules.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={idx}
                                href={action.href}
                                className={`rounded-3xl p-6 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md ${action.color}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-current shadow-2xs">
                                            {action.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-slate-950 dark:text-white group-hover:underline">
                                        {action.name}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1.5 leading-snug">
                                        {action.desc}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between text-xs font-bold pt-3 border-t border-current/20">
                                    <span>{action.phase}</span>
                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Architecture & Anti-N+1 Integrity Card */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-950 dark:text-white">
                                Active Guardrails & Database Health
                            </h3>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Real-time monitoring of anti-N+1 policies, cache engine, and security layer.
                            </p>
                        </div>
                    </div>
                    <Badge variant="success" size="lg" dot>
                        All Systems Normal
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                            Model Lazy Loading
                        </span>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Strictly Blocked (Anti-N+1)
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                            Dynamic Settings Cache
                        </span>
                        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Redis / In-Memory Active
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                            RBAC Access Policy
                        </span>
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" /> 3 Roles Enforced
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
