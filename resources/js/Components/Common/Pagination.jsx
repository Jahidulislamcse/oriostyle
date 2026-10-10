import React from 'react';
import { router } from '@inertiajs/react';

export default function Pagination({ pagination, className = '' }) {
    if (!pagination) return null;

    const links = pagination.links || [];
    const from = pagination.from || 0;
    const to = pagination.to || 0;
    const total = pagination.total || 0;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 w-full ${className}`}>
            <div className="text-xs text-slate-500 dark:text-[#BACDE3]">
                {total > 0 ? (
                    <>
                        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{from}</span> to{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{to}</span> of{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> entries
                    </>
                ) : (
                    <span>No entries to show</span>
                )}
            </div>

            {links.length > 3 && (
                <div className="flex flex-wrap items-center gap-1">
                    {links.map((link, idx) => {
                        if (!link.url) {
                            return (
                                <span
                                    key={idx}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-2.5 py-1.5 text-xs rounded-lg font-medium text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-[#1C3E63]/40 bg-slate-100/60 dark:bg-[#071324]/40 cursor-not-allowed select-none opacity-50"
                                />
                            );
                        }

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => router.visit(link.url, { preserveScroll: true, preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition ${
                                    link.active
                                        ? 'bg-[#D4AF37] text-[#071324] font-bold shadow-xs'
                                        : 'bg-white dark:bg-[#071324] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#142C49] border border-slate-200 dark:border-[#1C3E63]/70'
                                }`}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
