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
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <select
                id={id}
                value={value ?? ''}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`block w-full py-2.5 px-3.5 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-950 ${
                    error 
                        ? 'border-rose-400 dark:border-rose-500/80 focus:ring-rose-500' 
                        : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                } ${className}`}
                {...props}
            >
                {placeholder && <option value="" disabled className="text-slate-400">{placeholder}</option>}
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value ?? opt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {opt.label ?? opt}
                    </option>
                ))}
            </select>

            {error && <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
            {helpText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
        </div>
    );
}
