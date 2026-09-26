import React from 'react';

export default function Badge({
    variant = 'neutral',
    size = 'md',
    dot = false,
    className = '',
    children,
    ...props
}) {
    const variants = {
        gold: 'bg-[#FDFBF5] text-[#926F18] border-[#F5E7C2] dark:bg-[#142C49] dark:text-[#EBD495] dark:border-[#D4AF37]/50',
        orange: 'bg-[#FDFBF5] text-[#926F18] border-[#F5E7C2] dark:bg-[#142C49] dark:text-[#EBD495] dark:border-[#D4AF37]/50',
        navy: 'bg-[#F0F4F9] text-[#0E2038] border-[#BACDE3] dark:bg-[#142C49] dark:text-[#BACDE3] dark:border-[#1C3E63]',
        info: 'bg-[#F0F4F9] text-[#0E2038] border-[#BACDE3] dark:bg-[#142C49] dark:text-[#BACDE3] dark:border-[#1C3E63]',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
        purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#142C49]/60 dark:text-[#BACDE3] dark:border-[#1C3E63]',
    };

    const dotColors = {
        gold: 'bg-[#D4AF37]',
        orange: 'bg-[#D4AF37]',
        navy: 'bg-[#1C3E63]',
        info: 'bg-[#3B6D9B]',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        purple: 'bg-purple-500',
        blue: 'bg-blue-500',
        neutral: 'bg-slate-400',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs font-semibold',
        md: 'px-2.5 py-0.5 text-xs font-semibold',
        lg: 'px-3 py-1 text-sm font-semibold',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 uppercase tracking-wider rounded-lg border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral} animate-pulse`} />}
            <span>{children}</span>
        </span>
    );
}
