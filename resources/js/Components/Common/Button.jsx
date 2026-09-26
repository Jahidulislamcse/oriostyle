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
        primary: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold shadow-md shadow-teal-950/20 border-transparent',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium',
        danger: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-950/20 border-transparent',
        success: 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-950/20 border-transparent',
        outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700 font-medium',
        ghost: 'bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white border-transparent font-medium',
    };

    const sizes = {
        sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
        md: 'px-4 py-2 text-sm rounded-xl gap-2',
        lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled || processing}
            className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {processing ? (
                <Loader2 className="w-4 h-4 animate-spin text-current" />
            ) : Icon ? (
                <Icon className="w-4 h-4 text-current" />
            ) : null}
            <span>{children}</span>
        </button>
    );
}
