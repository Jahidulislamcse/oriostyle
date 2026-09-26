import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    isOpen = false,
    onClose,
    title = '',
    description = '',
    maxWidth = 'md', // sm, md, lg, xl, 2xl, 4xl
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
                className="fixed inset-0 bg-[#071324]/75 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div
                className={`relative w-full ${maxWidths[maxWidth] || maxWidths.md} bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] rounded-2xl shadow-xl overflow-hidden z-10 transform transition-all duration-200`}
            >
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 dark:border-[#1C3E63]/70 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-bold text-[#0E2038] dark:text-white tracking-tight">{title}</h3>}
                        {description && <p className="text-xs text-slate-500 dark:text-[#8EB0CF] mt-0.5">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-slate-700 dark:text-slate-200 max-h-[75vh] overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-3.5 bg-[#F4F7FB]/80 dark:bg-[#071324]/80 border-t border-slate-100 dark:border-[#1C3E63]/70 flex items-center justify-end gap-2.5">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
