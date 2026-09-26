import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    isOpen = false,
    onClose,
    title = '',
    description = '',
    maxWidth = 'md', // sm, md, lg, xl, 2xl
    children,
    footer = null,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div
                className={`relative w-full ${maxWidths[maxWidth] || maxWidths.md} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 transform transition-all duration-200`}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
                        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
