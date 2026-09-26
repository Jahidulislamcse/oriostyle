import React from 'react';

export default function FormInput({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = null,
    helpText = null,
    required = false,
    disabled = false,
    icon: Icon = null,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-[#BACDE3] mb-1.5"
                >
                    {label} {required && <span className="text-rose-500 font-bold">*</span>}
                </label>
            )}

            <div className="relative rounded-xl shadow-2xs">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                        <Icon className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
                    </div>
                )}

                <input
                    id={id}
                    type={type}
                    value={value ?? ''}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    className={`block w-full py-2.5 lg:py-3 bg-white dark:bg-[#071324] border rounded-xl text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] text-sm lg:text-base font-medium transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-[#071324]/50 ${
                        Icon ? 'pl-10.5 pr-3.5' : 'px-3.5 lg:px-4'
                    } ${
                        error 
                            ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-400/20 focus:border-rose-500' 
                            : 'border-slate-200 dark:border-[#1C3E63] hover:border-slate-300 dark:hover:border-[#3B6D9B]'
                    } ${className}`}
                    {...props}
                />
            </div>

            {error && <p className="mt-1.5 text-xs lg:text-sm text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
            {helpText && !error && <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-[#8EB0CF]">{helpText}</p>}
        </div>
    );
}
