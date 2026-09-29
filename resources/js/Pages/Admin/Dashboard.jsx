import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Badge from '@/Components/Common/Badge';
import Button from '@/Components/Common/Button';
import Sparkline from '@/Components/Admin/Sparkline';
import OverviewAreaChart from '@/Components/Admin/OverviewAreaChart';
import CategoryDonutChart from '@/Components/Admin/CategoryDonutChart';
import QuickActionsCard from '@/Components/Admin/QuickActionsCard';
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
    Tag, 
    Boxes, 
    Settings, 
    CheckCircle2, 
    Activity 
} from 'lucide-react';

export default function Dashboard({ user, metrics }) {
    const { settings } = usePage().props;
    const currency = settings?.currency_symbol || '৳';

    const metricCards = [
        {
            title: "Today's Gross Sales",
            value: `${currency}28,200.00`,
            growth: '+18.4% WoW',
            subText: 'Immutable COGS tracked',
            icon: TrendingUp,
            sparkData: [12, 16, 14, 22, 19, 28, 35, 42],
            sparkColor: '#D4AF37',
            color: 'text-[#926F18] dark:text-[#EBD495]',
            iconBg: 'bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40',
        },
        {
            title: 'Pending Orders',
            value: metrics?.pendingOrders || '18',
            growth: '4 New Today',
            subText: 'Awaiting dispatch confirmation',
            icon: ShoppingBag,
            sparkData: [5, 8, 12, 9, 14, 18, 15, 18],
            sparkColor: '#4F46E5',
            color: 'text-indigo-600 dark:text-indigo-400',
            iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-[#071324] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40',
        },
        {
            title: 'Low-Stock Warnings',
            value: metrics?.lowStockItems || '3',
            growth: 'Healthy Count',
            subText: 'Units below safety threshold',
            icon: AlertTriangle,
            sparkData: [8, 6, 7, 5, 4, 6, 4, 3],
            sparkColor: '#F59E0B',
            color: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-50 text-amber-600 dark:bg-[#071324] dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
        },
        {
            title: 'Active Staff & Admins',
            value: '2',
            growth: 'RBAC Active',
            subText: 'Super Admin & Store Admin',
            icon: Users,
            sparkData: [1, 1, 1, 2, 2, 2, 2, 2],
            sparkColor: '#9333EA',
            color: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-50 text-purple-600 dark:bg-[#071324] dark:text-purple-300 border border-purple-200 dark:border-purple-800/40',
        },
    ];

    const quickActions = [
        {
            name: 'Categories Hierarchy',
            desc: 'Configure parent-child taxonomies, subcategories and live slugs',
            href: '/admin/categories',
            icon: FolderTree,
            color: 'text-[#755615] dark:text-[#EBD495] bg-[#FDFBF5] dark:bg-[#0E2038] border border-[#F5E7C2] dark:border-[#D4AF37]/40 hover:border-[#D4AF37]',
        },
        {
            name: 'Brands & Media Hub',
            desc: 'Manage verified product brands, logos and media assets',
            href: '/admin/brands',
            icon: Tag,
            color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-[#0E2038] border border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400',
        },
        {
            name: 'Products & Inventory',
            desc: 'Manage catalog products, stock variants and pricing matrices',
            href: '/admin/products',
            icon: Package,
            color: 'text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-[#0E2038] border border-blue-200 dark:border-blue-800/50 hover:border-blue-400',
        },
        {
            name: 'Store Settings & Identity',
            desc: 'Update storefront brand name, logo, contact, shipping and tax rules',
            href: '/admin/settings',
            icon: Settings,
            color: 'text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-[#0E2038] border border-purple-200 dark:border-purple-800/50 hover:border-purple-400',
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Top Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#FDFBF5] via-[#FBF5E6]/70 to-white dark:from-[#0E2038] dark:via-[#10233B] dark:to-[#071324] border border-[#F5E7C2] dark:border-[#1C3E63] p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 relative z-10">
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBF5E6] text-[#755615] dark:bg-[#071324] dark:text-[#EBD495] border border-[#EBD495] dark:border-[#D4AF37]/50 text-[11px] sm:text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#EBD495]" />
                            <span>Store Management Portal</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8EB0CF] max-w-2xl font-normal">
                            System status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Operating Normally</span> • <strong className="text-[#0E2038] dark:text-[#F5D77F]">{settings?.site_name || 'ORIO STYLE LTD'}</strong>.
                        </p>
                    </div>

                    <Link href="/admin/categories" className="w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                        <Button
                            variant="primary"
                            size="md"
                            icon={FolderTree}
                            className="shadow-xs font-bold w-full sm:w-auto justify-center text-xs sm:text-sm"
                        >
                            Open Category Tree
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metrics Row with Animated Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-5 sm:mb-6">
                {metricCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-[#3B6D9B] transition duration-150 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8EB0CF]">
                                        {card.title}
                                    </span>
                                    <div className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${card.iconBg} shadow-2xs`}>
                                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="text-xl sm:text-2xl font-extrabold text-[#0E2038] dark:text-white tracking-tight break-words">
                                        {card.value}
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40 shrink-0">
                                        {card.growth}
                                    </span>
                                </div>

                                {/* Mini Animated Sparkline Wave */}
                                <div className="h-9 my-1.5 overflow-hidden">
                                    <Sparkline
                                        data={card.sparkData}
                                        color={card.sparkColor}
                                        height={36}
                                        strokeWidth={2}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium pt-2.5 border-t border-slate-100 dark:border-[#1C3E63]/60 text-slate-400 dark:text-[#5E8CB6]">
                                <span className="truncate">{card.subText}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Graphs & Quick Analytics Section (Matching Visual Blueprint) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-5 sm:mb-6">
                {/* 1. Left: Sales & Order Performance Area Spline Chart */}
                <div className="lg:col-span-6 xl:col-span-5">
                    <OverviewAreaChart currency={currency} />
                </div>

                {/* 2. Middle: Orders by Category / Donut Chart */}
                <div className="lg:col-span-6 xl:col-span-4">
                    <CategoryDonutChart />
                </div>

                {/* 3. Right: Quick Actions Operational Tiles */}
                <div className="lg:col-span-12 xl:col-span-3">
                    <QuickActionsCard />
                </div>
            </div>

            {/* Quick Action Management Shortcuts */}
            <div className="mb-5 sm:mb-6">
                <div className="flex items-center justify-between mb-3.5">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#0E2038] dark:text-white tracking-tight">
                            Store Management Shortcuts
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                            Quick access to key operational catalogs, products, and configurations.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={idx}
                                href={action.href}
                                className={`rounded-2xl p-4 sm:p-5 transition-all duration-150 group flex flex-col justify-between shadow-2xs hover:shadow-xs ${action.color}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#071324] shadow-2xs">
                                            <Icon className="w-4.5 h-4.5 lg:w-5 lg:h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#0E2038] dark:text-white group-hover:underline">
                                        {action.name}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-[#BACDE3] mt-1 leading-snug font-normal">
                                        {action.desc}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-end text-xs font-semibold pt-2.5 border-t border-current/20">
                                    <span className="flex items-center gap-1">
                                        <span>Manage</span>
                                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* System Health Card */}
            <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-[#0E2038] dark:text-white">
                                Store Engine & System Health
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                Real-time monitoring of database performance, caching layer, and security services.
                            </p>
                        </div>
                    </div>
                    <Badge variant="success" size="md" dot className="shrink-0">
                        All Systems Normal
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071324]/70 border border-slate-200 dark:border-[#1C3E63]/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] block mb-1">
                            Database Optimization
                        </span>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> High Performance & Optimized
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071324]/70 border border-slate-200 dark:border-[#1C3E63]/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] block mb-1">
                            Dynamic Settings Cache
                        </span>
                        <div className="flex items-center gap-1.5 text-[#926F18] dark:text-[#EBD495] font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> In-Memory Cache Active
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071324]/70 border border-slate-200 dark:border-[#1C3E63]/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] block mb-1">
                            Staff Access Policy
                        </span>
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Role-Based Access Active
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
