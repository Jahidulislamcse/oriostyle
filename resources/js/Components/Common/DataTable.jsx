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
        <div className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Header Toolbar */}
            {(searchable || actions) && (
                <div className="p-4 sm:p-5 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900">
                    {searchable && (
                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="block w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 transition"
                            />
                        </div>
                    )}
                    {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{actions}</div>}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-slate-200 dark:divide-slate-800 text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800/90 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    scope="col"
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    className={`px-6 py-4 ${
                                        col.sortable !== false ? 'cursor-pointer select-none hover:text-teal-700 dark:hover:text-teal-300 transition' : ''
                                    } ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{col.label}</span>
                                        {col.sortable !== false && (
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
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
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-6 py-4.5 whitespace-nowrap ${col.cellClassName || ''}`}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                                        <span className="text-sm font-semibold">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="p-4 sm:p-5 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900">
                    {pagination}
                </div>
            )}
        </div>
    );
}
