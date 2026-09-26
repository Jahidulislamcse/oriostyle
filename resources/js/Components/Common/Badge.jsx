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
        orange: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50',
        info: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50',
        purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };

    const dotColors = {
        orange: 'bg-orange-400',
        info: 'bg-orange-400',
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
