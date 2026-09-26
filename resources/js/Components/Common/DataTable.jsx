import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, Inbox } from 'lucide-react';

export default function DataTable({
    columns = [],
    data = [],
    searchable = true,
    searchPlaceholder = 'Search records...',
    emptyMessage = 'No records found.',
    actions = null,
    pagination = null,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredData = useMemo(() => {
        let result = [...data];

        // Search filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter((item) =>
                columns.some((col) => {
                    const val = item[col.key];
                    return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
                })
            );
        }

        // Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchQuery, sortConfig, columns]);

    return (
        <div className="w-full bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl overflow-hidden shadow-xs">
            {/* Header Toolbar */}
            {(searchable || actions) && (
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#1C3E63]/70 flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-[#F4F7FB]/70 dark:bg-[#0E2038]">
                    {searchable && (
                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#5E8CB6]">
                                <Search className="w-4.5 h-4.5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="block w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-[#071324] border border-slate-200 dark:border-[#1C3E63] rounded-xl text-sm lg:text-base text-[#0E2038] dark:text-white placeholder-slate-400 dark:placeholder-[#5E8CB6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition font-medium"
                            />
                        </div>
                    )}
                    {actions && <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">{actions}</div>}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-[#1C3E63]/70 text-left">
                    <thead className="bg-[#F4F7FB] dark:bg-[#071324] text-xs lg:text-sm font-bold uppercase tracking-wider text-[#0E2038] dark:text-[#BACDE3]">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    scope="col"
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    className={`px-5 py-4 ${
                                        col.sortable !== false ? 'cursor-pointer select-none hover:text-[#D4AF37] dark:hover:text-[#F5D77F] transition' : ''
                                    } ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>{col.label}</span>
                                        {col.sortable !== false && (
                                            <span className="text-slate-400 dark:text-[#5E8CB6]">
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown className="w-3.5 h-3.5" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1C3E63]/60 text-sm lg:text-base text-slate-800 dark:text-slate-200">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-[#FDFBF5]/60 dark:hover:bg-[#142C49]/60 transition">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-5 py-4 whitespace-nowrap ${col.cellClassName || ''}`}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400 dark:text-[#8EB0CF]">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Inbox className="w-9 h-9 text-slate-400 dark:text-[#5E8CB6]" />
                                        <span className="text-sm lg:text-base font-medium">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-[#1C3E63]/70 flex items-center justify-between text-xs lg:text-sm text-slate-600 dark:text-[#BACDE3] bg-[#F4F7FB]/70 dark:bg-[#071324]">
                    {pagination}
                </div>
            )}
        </div>
    );
}
