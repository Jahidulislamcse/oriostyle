import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Zap,
    UserPlus,
    ShoppingBag,
    Package,
    FolderPlus,
    Settings,
    FileText,
    ArrowUpRight,
    Tag,
    Boxes
} from 'lucide-react';

export default function QuickActionsCard() {
    const actions = [
        {
            name: 'New Category',
            href: '/admin/categories',
            icon: FolderPlus,
            color: 'text-[#926F18] dark:text-[#EBD495]',
            bg: 'bg-[#FDFBF5] dark:bg-[#071324] border border-[#F5E7C2] dark:border-[#D4AF37]/40',
        },
        {
            name: 'Manage Products',
            href: '/admin/products',
            icon: Package,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50/70 dark:bg-[#071324] border border-indigo-200 dark:border-indigo-800/50',
        },
        {
            name: 'Brand Hub',
            href: '/admin/brands',
            icon: Tag,
            color: 'text-cyan-600 dark:text-cyan-400',
            bg: 'bg-cyan-50/70 dark:bg-[#071324] border border-cyan-200 dark:border-cyan-800/50',
        },
        {
            name: 'Order Queue',
            href: '/admin/orders',
            icon: ShoppingBag,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/70 dark:bg-[#071324] border border-emerald-200 dark:border-emerald-800/50',
        },
        {
            name: 'Store Settings',
            href: '/admin/settings',
            icon: Settings,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50/70 dark:bg-[#071324] border border-purple-200 dark:border-purple-800/50',
        },
        {
            name: 'Audit Reports',
            href: '/admin/reports',
            icon: FileText,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50/70 dark:bg-[#071324] border border-amber-200 dark:border-amber-800/50',
        },
    ];

    return (
        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40 shrink-0">
                        <Zap className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                            Quick Actions
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                            Operational shortcuts
                        </p>
                    </div>
                </div>

                <Link
                    href="/admin/categories"
                    className="text-xs font-bold text-[#926F18] dark:text-[#EBD495] hover:underline inline-flex items-center gap-1"
                >
                    <span>View All</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* 6 Grid Action Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 my-auto">
                {actions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={idx}
                            href={action.href}
                            className="group p-3 rounded-xl bg-slate-50/70 dark:bg-[#071324]/60 hover:bg-[#FDFBF5] dark:hover:bg-[#142C49] border border-slate-200/80 dark:border-[#1C3E63]/70 hover:border-[#D4AF37]/50 transition duration-150 flex flex-col items-center text-center justify-center gap-2 shadow-2xs hover:shadow-xs"
                        >
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition duration-200 shadow-2xs`}
                            >
                                <Icon className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#0E2038] dark:group-hover:text-[#F5D77F] transition leading-tight">
                                {action.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Status */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1C3E63]/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-[#8EB0CF]">Role Authorization</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Super Admin Mode</span>
            </div>
        </div>
    );
}
