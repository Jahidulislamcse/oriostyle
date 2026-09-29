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
        <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#071324]/75 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div
                className={`relative w-full ${maxWidths[maxWidth] || maxWidths.md} bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63] rounded-2xl shadow-xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col transform transition-all duration-200`}
            >
                {/* Header */}
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#1C3E63]/70 flex items-center justify-between shrink-0">
                    <div className="min-w-0 pr-2">
                        {title && <h3 className="text-base sm:text-lg font-extrabold text-[#0E2038] dark:text-white tracking-tight truncate">{title}</h3>}
                        {description && <p className="text-xs text-slate-500 dark:text-[#8EB0CF] mt-0.5 line-clamp-2">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-[#0E2038] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#142C49] transition cursor-pointer shrink-0"
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 text-xs sm:text-sm text-slate-700 dark:text-slate-200 overflow-y-auto flex-1">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-[#F4F7FB]/80 dark:bg-[#071324]/80 border-t border-slate-100 dark:border-[#1C3E63]/70 flex items-center justify-end gap-2.5 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
