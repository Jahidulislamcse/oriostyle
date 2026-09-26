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
        success: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
        warning: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
        danger: 'bg-rose-950/60 text-rose-400 border-rose-500/30',
        info: 'bg-teal-950/60 text-teal-300 border-teal-500/30',
        purple: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
        blue: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
        neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    };

    const dotColors = {
        success: 'bg-emerald-400',
        warning: 'bg-amber-400',
        danger: 'bg-rose-400',
        info: 'bg-teal-400',
        purple: 'bg-purple-400',
        blue: 'bg-blue-400',
        neutral: 'bg-slate-400',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral} animate-pulse`} />}
            <span>{children}</span>
        </span>
    );
}
