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
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                    {label} {required && <span className="text-rose-500 font-bold">*</span>}
                </label>
            )}

            <div className="relative rounded-xl shadow-2xs">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Icon className="h-4.5 w-4.5" />
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
                    className={`block w-full py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#C8A844]/25 focus:border-[#C8A844] disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-950 ${
                        Icon ? 'pl-10 pr-3.5' : 'px-3.5'
                    } ${
                        error 
                            ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-400/20 focus:border-rose-500' 
                            : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    } ${className}`}
                    {...props}
                />
            </div>

            {error && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
            {helpText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
        </div>
    );
}
