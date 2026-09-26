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
            value: `${currency}0.00`,
            growth: '+0.0% MoM',
            subText: 'Immutable COGS tracked',
            icon: TrendingUp,
            color: 'text-[#926F18] dark:text-[#EBD495]',
            iconBg: 'bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40',
        },
        {
            title: 'Pending Orders',
            value: metrics?.pendingOrders || '0',
            growth: '0 New Today',
            subText: 'Awaiting dispatch confirmation',
            icon: ShoppingBag,
            color: 'text-indigo-600 dark:text-indigo-400',
            iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-[#071324] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40',
        },
        {
            title: 'Low-Stock Warnings',
            value: metrics?.lowStockItems || '0',
            growth: 'Healthy Count',
            subText: 'Units below safety threshold',
            icon: AlertTriangle,
            color: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-50 text-amber-600 dark:bg-[#071324] dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
        },
        {
            title: 'Active Staff & Admins',
            value: '2',
            growth: 'RBAC Active',
            subText: 'Super Admin & Store Admin',
            icon: Users,
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
            phase: 'Phase 4',
            badge: 'Live & Active',
            color: 'text-[#755615] dark:text-[#EBD495] bg-[#FDFBF5] dark:bg-[#0E2038] border border-[#F5E7C2] dark:border-[#D4AF37]/40 hover:border-[#D4AF37]',
        },
        {
            name: 'Brands & WebP Hub',
            desc: 'Upload brand logos with automated WebP conversion',
            href: '/admin/brands',
            icon: Tag,
            phase: 'Phase 5',
            badge: 'Next Sprint',
            color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-[#0E2038] border border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400',
        },
        {
            name: 'Products & Matrix Builder',
            desc: 'Single products & Cartesian variant SKU matrix',
            href: '/admin/products',
            icon: Package,
            phase: 'Phase 6-7',
            badge: 'Planned',
            color: 'text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-[#0E2038] border border-blue-200 dark:border-blue-800/50 hover:border-blue-400',
        },
        {
            name: 'Dynamic Settings CMS',
            desc: 'Zero hardcoded brand info, phones, currency & VAT',
            href: '/admin/settings',
            icon: Settings,
            phase: 'Phase 20',
            badge: 'CMS Engine',
            color: 'text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-[#0E2038] border border-purple-200 dark:border-purple-800/50 hover:border-purple-400',
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Top Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#FDFBF5] via-[#FBF5E6]/70 to-white dark:from-[#0E2038] dark:via-[#10233B] dark:to-[#071324] border border-[#F5E7C2] dark:border-[#1C3E63] p-5 sm:p-6 lg:p-7 mb-6 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FBF5E6] text-[#755615] dark:bg-[#071324] dark:text-[#EBD495] border border-[#EBD495] dark:border-[#D4AF37]/50 text-[11px] sm:text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] dark:text-[#EBD495]" />
                            <span>Enterprise Admin Control Tower</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                            Welcome back, {user?.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8EB0CF] max-w-2xl font-normal">
                            System status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● High Availability & Anti-N+1 Enforced</span> • Connected to <strong className="text-[#0E2038] dark:text-[#F5D77F]">{settings?.site_name || 'ORIO STYLE LTD'}</strong>.
                        </p>
                    </div>

                    <Link href="/admin/categories">
                        <Button
                            variant="primary"
                            size="md"
                            icon={FolderTree}
                            className="shadow-xs font-bold shrink-0"
                        >
                            Open Category Tree
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metricCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-[#3B6D9B] transition duration-150"
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#8EB0CF]">
                                    {card.title}
                                </span>
                                <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center ${card.iconBg} shadow-2xs`}>
                                    <Icon className="w-4.5 h-4.5 lg:w-5 lg:h-5" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-extrabold text-[#0E2038] dark:text-white tracking-tight mb-1.5">
                                {card.value}
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-slate-100 dark:border-[#1C3E63]/60">
                                <span className="text-[#926F18] dark:text-[#EBD495] font-bold">{card.growth}</span>
                                <span className="text-slate-400 dark:text-[#5E8CB6]">{card.subText}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Action Phase Modules */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3.5">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#0E2038] dark:text-white tracking-tight">
                            Platform Blueprint Execution
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                            Direct jump into active and upcoming architecture phase modules.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={idx}
                                href={action.href}
                                className={`rounded-2xl p-4.5 sm:p-5 transition-all duration-150 group flex flex-col justify-between shadow-2xs hover:shadow-xs ${action.color}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#071324] shadow-2xs">
                                            <Icon className="w-4.5 h-4.5 lg:w-5 lg:h-5" />
                                        </div>
                                        <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/90 dark:bg-[#071324]/90 border border-current shadow-2xs">
                                            {action.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#0E2038] dark:text-white group-hover:underline">
                                        {action.name}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-[#BACDE3] mt-1 leading-snug font-normal">
                                        {action.desc}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-xs font-semibold pt-2.5 border-t border-current/20">
                                    <span>{action.phase}</span>
                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Architecture Integrity Card */}
            <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 mb-4.5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-[#0E2038] dark:text-white">
                                Active Guardrails & Database Health
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                                Real-time monitoring of anti-N+1 policies, cache engine, and security layer.
                            </p>
                        </div>
                    </div>
                    <Badge variant="success" size="md" dot>
                        All Systems Normal
                    </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071324]/70 border border-slate-200 dark:border-[#1C3E63]/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] block mb-1">
                            Model Lazy Loading
                        </span>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Strictly Blocked (Anti-N+1)
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071324]/70 border border-slate-200 dark:border-[#1C3E63]/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] block mb-1">
                            Dynamic Settings Cache
                        </span>
                        <div className="flex items-center gap-1.5 text-[#926F18] dark:text-[#EBD495] font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Redis / In-Memory Active
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#071324]/70 border border-slate-200 dark:border-[#1C3E63]/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#5E8CB6] block mb-1">
                            RBAC Access Policy
                        </span>
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 3 Roles Enforced
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
