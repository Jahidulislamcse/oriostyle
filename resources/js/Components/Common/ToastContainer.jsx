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
            bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400',
        },
        error: {
            bg: 'bg-rose-950/90 border-rose-500/40 text-rose-200',
            icon: AlertCircle,
            iconColor: 'text-rose-400',
        },
        warning: {
            bg: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
            icon: AlertTriangle,
            iconColor: 'text-amber-400',
        },
        info: {
            bg: 'bg-teal-950/90 border-teal-500/40 text-teal-200',
            icon: Info,
            iconColor: 'text-teal-400',
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
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in ${config.bg}`}
                    >
                        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                        <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-white transition p-0.5 rounded cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
