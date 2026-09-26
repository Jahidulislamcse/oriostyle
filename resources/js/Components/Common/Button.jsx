import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    processing = false,
    disabled = false,
    children,
    icon: Icon,
    ...props
}) {
    const variants = {
        primary: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold shadow-sm hover:shadow transition border border-teal-700/20',
        secondary: 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold shadow-sm',
        danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-sm border border-rose-700/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-sm border border-emerald-700/20',
        outline: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-transparent font-medium',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
        md: 'px-4 py-2 text-sm rounded-xl gap-2',
        lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled || processing}
            className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {processing ? (
                <Loader2 className="w-4 h-4 animate-spin text-current" />
            ) : Icon ? (
                <Icon className="w-4 h-4 text-current flex-shrink-0" />
            ) : null}
            <span>{children}</span>
        </button>
    );
}
