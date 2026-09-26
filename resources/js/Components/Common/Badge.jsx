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
        orange: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700',
        info: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-950/80 dark:text-orange-200 dark:border-orange-700',
        success: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700',
        warning: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700',
        danger: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700',
        purple: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-700',
        blue: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700',
        teal: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-700',
        neutral: 'bg-slate-200/80 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
    };

    const dotColors = {
        orange: 'bg-orange-500',
        info: 'bg-orange-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        purple: 'bg-purple-500',
        blue: 'bg-blue-500',
        teal: 'bg-teal-500',
        neutral: 'bg-slate-500',
    };

    const sizes = {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {dot && <span className={`w-2 h-2 rounded-full ${dotColors[variant] || dotColors.neutral} animate-pulse`} />}
            <span>{children}</span>
        </span>
    );
}
