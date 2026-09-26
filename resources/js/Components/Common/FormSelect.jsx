import React from 'react';

export default function FormSelect({
    id,
    label,
    value,
    onChange,
    options = [],
    error = null,
    helpText = null,
    required = false,
    disabled = false,
    placeholder = 'Select an option',
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

            <select
                id={id}
                value={value ?? ''}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`block w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 rounded-xl text-slate-950 dark:text-white text-sm sm:text-base font-medium transition focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-600 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-950 ${
                    error 
                        ? 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/20 focus:border-rose-600' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                } ${className}`}
                {...props}
            >
                {placeholder && <option value="" disabled className="text-slate-400 font-medium">{placeholder}</option>}
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value ?? opt} className="bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-medium py-1">
                        {opt.label ?? opt}
                    </option>
                ))}
            </select>

            {error && <p className="mt-1.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{error}</p>}
            {helpText && !error && <p className="mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">{helpText}</p>}
        </div>
    );
}
