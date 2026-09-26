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
        primary: 'bg-[#C8A844] hover:bg-[#b29134] active:bg-[#8e7127] text-white font-semibold shadow-xs hover:shadow-sm transition border border-[#C8A844]/30',
        secondary: 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs hover:border-slate-300 dark:hover:border-slate-600',
        danger: 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold shadow-xs border border-rose-500/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-xs border border-emerald-600/20',
        soft: 'bg-[#fbf9f2] hover:bg-[#f6f1df] text-[#8e7127] dark:bg-[#392a0f]/50 dark:hover:bg-[#392a0f]/80 dark:text-[#deca94] font-semibold border border-[#ece1be] dark:border-[#8e7127]/60',
        outline: 'bg-transparent hover:bg-[#fbf9f2] dark:hover:bg-slate-800 text-[#C8A844] dark:text-[#deca94] border border-[#C8A844]/60 font-semibold',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-transparent font-medium',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
        md: 'px-4 py-2.2 text-sm rounded-xl gap-2',
        lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled || processing}
            className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C8A844]/40 focus:ring-offset-1 dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
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
