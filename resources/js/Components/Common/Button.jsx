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
        primary: 'bg-[#D4AF37] hover:bg-[#B89226] active:bg-[#926F18] text-[#071324] font-semibold shadow-2xs hover:shadow-xs transition border border-[#D4AF37]/70',
        navy: 'bg-[#0E2038] hover:bg-[#1C3E63] active:bg-[#142C49] text-[#F5D77F] dark:bg-[#142C49] dark:hover:bg-[#1C3E63] dark:text-[#F5D77F] font-semibold shadow-2xs border border-[#D4AF37]/40',
        secondary: 'bg-white hover:bg-slate-50 dark:bg-[#142C49] dark:hover:bg-[#1C3E63] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1C3E63] font-semibold shadow-2xs hover:border-slate-300 dark:hover:border-slate-600',
        danger: 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold shadow-2xs border border-rose-500/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-2xs border border-emerald-600/20',
        soft: 'bg-[#FDFBF5] hover:bg-[#FBF5E6] text-[#926F18] dark:bg-[#142C49] dark:hover:bg-[#1C3E63] dark:text-[#EBD495] font-semibold border border-[#F5E7C2] dark:border-[#D4AF37]/40',
        outline: 'bg-transparent hover:bg-[#FDFBF5] dark:hover:bg-[#142C49] text-[#926F18] dark:text-[#DFC068] border border-[#D4AF37] font-semibold',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-[#142C49] text-slate-600 hover:text-[#0E2038] dark:text-[#8EB0CF] dark:hover:text-white border-transparent font-medium',
    };

    const sizes = {
        xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
        sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
        md: 'px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl gap-2',
        lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold rounded-xl gap-2.5',
    };

    return (
        <button
            type={type}
            disabled={disabled || processing}
            className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:ring-offset-1 dark:focus:ring-offset-[#071324] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
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
