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
                    className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2"
                >
                    {label} {required && <span className="text-rose-600 font-bold">*</span>}
                </label>
            )}

            <div className="relative rounded-xl shadow-xs">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                        <Icon className="h-5 w-5" />
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
                    className={`block w-full py-3 bg-white dark:bg-slate-900 border-2 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base font-medium transition focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-950 ${
                        Icon ? 'pl-11 pr-4' : 'px-4'
                    } ${
                        error 
                            ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-600' 
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    } ${className}`}
                    {...props}
                />
            </div>

            {error && <p className="mt-1.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{error}</p>}
            {helpText && !error && <p className="mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">{helpText}</p>}
        </div>
    );
}
