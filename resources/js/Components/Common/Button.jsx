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
        primary: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold shadow-md shadow-orange-600/20 hover:shadow-lg hover:shadow-orange-600/30 border border-orange-700/20',
        secondary: 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-700 font-bold shadow-xs hover:border-slate-400 dark:hover:border-slate-600',
        danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold shadow-md shadow-rose-600/20 border border-rose-700/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-600/20 border border-emerald-700/20',
        orange: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold shadow-md shadow-orange-500/20',
        outline: 'bg-transparent hover:bg-orange-50 dark:hover:bg-slate-800 text-orange-600 dark:text-orange-400 border-2 border-orange-500 font-bold',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white border-transparent font-semibold',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
        md: 'px-4.5 py-2.5 text-sm rounded-xl gap-2',
        lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled || processing}
            className={`inline-flex items-center justify-center font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
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
