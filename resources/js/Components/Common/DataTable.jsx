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
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header Toolbar */}
            {(searchable || actions) && (
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {searchable && (
                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="block w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                        </div>
                    )}
                    {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{actions}</div>}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left">
                    <thead className="bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    scope="col"
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    className={`px-6 py-3.5 ${
                                        col.sortable !== false ? 'cursor-pointer select-none hover:text-teal-400 transition' : ''
                                    } ${col.className || ''}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>{col.label}</span>
                                        {col.sortable !== false && (
                                            <span className="text-slate-600">
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <ChevronUp className="w-3.5 h-3.5 text-teal-400" />
                                                    ) : (
                                                        <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown className="w-3 h-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIdx) => (
                                <tr key={rowIdx} className="hover:bg-slate-800/40 transition">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ''}`}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Inbox className="w-8 h-8 text-slate-600" />
                                        <span>{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    {pagination}
                </div>
            )}
        </div>
    );
}
