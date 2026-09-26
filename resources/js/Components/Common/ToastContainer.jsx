import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (!flash) return;

        ['success', 'error', 'warning', 'info'].forEach((type) => {
            if (flash[type]) {
                addToast(flash[type], type);
            }
        });
    }, [flash]);

    const addToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    const styles = {
        success: {
            bg: 'bg-white dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500/40 text-slate-800 dark:text-emerald-200 shadow-xl',
            icon: CheckCircle2,
            iconColor: 'text-emerald-600 dark:text-emerald-400',
        },
        error: {
            bg: 'bg-white dark:bg-rose-950/90 border-rose-300 dark:border-rose-500/40 text-slate-800 dark:text-rose-200 shadow-xl',
            icon: AlertCircle,
            iconColor: 'text-rose-600 dark:text-rose-400',
        },
        warning: {
            bg: 'bg-white dark:bg-amber-950/90 border-amber-300 dark:border-amber-500/40 text-slate-800 dark:text-amber-200 shadow-xl',
            icon: AlertTriangle,
            iconColor: 'text-amber-600 dark:text-amber-400',
        },
        info: {
            bg: 'bg-white dark:bg-teal-950/90 border-teal-300 dark:border-teal-500/40 text-slate-800 dark:text-teal-200 shadow-xl',
            icon: Info,
            iconColor: 'text-teal-600 dark:text-teal-400',
        },
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => {
                const config = styles[toast.type] || styles.info;
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${config.bg}`}
                    >
                        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                        <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-0.5 rounded cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
