import React, { useState, useEffect } from 'react';
import { PieChart, Truck, FolderTree, ChevronDown } from 'lucide-react';

export default function CategoryDonutChart() {
    const [filter, setFilter] = useState('month');
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isAnimated, setIsAnimated] = useState(false);

    const dataSets = {
        month: {
            total: 128,
            title: 'Total Orders',
            segments: [
                { name: 'Men Formal', value: 67, percent: 52, color: '#0284C7', bg: 'bg-[#0284C7]' },
                { name: 'Casual Wear', value: 28, percent: 22, color: '#06B6D4', bg: 'bg-[#06B6D4]' },
                { name: 'Accessories', value: 21, percent: 16, color: '#10B981', bg: 'bg-[#10B981]' },
                { name: 'Winter Collection', value: 9, percent: 7, color: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
                { name: 'Others', value: 3, percent: 3, color: '#F59E0B', bg: 'bg-[#F59E0B]' },
            ],
        },
        week: {
            total: 34,
            title: 'Weekly Volume',
            segments: [
                { name: 'Men Formal', value: 18, percent: 53, color: '#0284C7', bg: 'bg-[#0284C7]' },
                { name: 'Casual Wear', value: 8, percent: 24, color: '#06B6D4', bg: 'bg-[#06B6D4]' },
                { name: 'Accessories', value: 5, percent: 15, color: '#10B981', bg: 'bg-[#10B981]' },
                { name: 'Winter Collection', value: 2, percent: 6, color: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
                { name: 'Others', value: 1, percent: 2, color: '#F59E0B', bg: 'bg-[#F59E0B]' },
            ],
        },
        year: {
            total: 1420,
            title: 'Annual Volume',
            segments: [
                { name: 'Men Formal', value: 710, percent: 50, color: '#0284C7', bg: 'bg-[#0284C7]' },
                { name: 'Casual Wear', value: 355, percent: 25, color: '#06B6D4', bg: 'bg-[#06B6D4]' },
                { name: 'Accessories', value: 213, percent: 15, color: '#10B981', bg: 'bg-[#10B981]' },
                { name: 'Winter Collection', value: 99, percent: 7, color: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
                { name: 'Others', value: 43, percent: 3, color: '#F59E0B', bg: 'bg-[#F59E0B]' },
            ],
        },
    };

    const current = dataSets[filter] || dataSets.month;

    useEffect(() => {
        setIsAnimated(false);
        const timer = setTimeout(() => setIsAnimated(true), 60);
        return () => clearTimeout(timer);
    }, [filter]);

    // Donut Geometry Parameters
    const size = 180;
    const strokeWidth = 26;
    const center = size / 2;
    const radius = center - strokeWidth / 2 - 4;
    const circumference = 2 * Math.PI * radius;

    let accumulatedOffset = 0;

    return (
        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40 shrink-0">
                        <FolderTree className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                            Orders by Category
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                            Catalog distribution breakdown
                        </p>
                    </div>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#071324] p-1 border border-slate-200 dark:border-[#1C3E63]">
                    {[
                        { id: 'week', label: 'Week' },
                        { id: 'month', label: 'Month' },
                        { id: 'year', label: 'Year' },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            type="button"
                            onClick={() => setFilter(btn.id)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                                filter === btn.id
                                    ? 'bg-white dark:bg-[#142C49] text-[#926F18] dark:text-[#EBD495] shadow-2xs'
                                    : 'text-slate-500 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Donut & Legend Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-auto">
                {/* Donut Chart SVG (Left/Center) */}
                <div className="sm:col-span-6 flex items-center justify-center relative">
                    <div className="relative w-40 h-40 sm:w-44 sm:h-44">
                        <svg
                            viewBox={`0 0 ${size} ${size}`}
                            className="w-full h-full transform -rotate-90 overflow-visible"
                        >
                            {/* Background Track */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="text-slate-100 dark:text-[#071324]"
                            />

                            {/* Donut Segments */}
                            {current.segments.map((seg, idx) => {
                                const strokeLength = (seg.percent / 100) * circumference;
                                const strokeDashoffset = isAnimated
                                    ? -accumulatedOffset
                                    : circumference;
                                const isHovered = hoveredIndex === idx;

                                accumulatedOffset += strokeLength;

                                return (
                                    <circle
                                        key={idx}
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        fill="transparent"
                                        stroke={seg.color}
                                        strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                        strokeDasharray={`${strokeLength} ${circumference}`}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-700 ease-out cursor-pointer origin-center hover:opacity-90"
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        style={{
                                            transitionProperty: 'stroke-dashoffset, stroke-width',
                                            transitionDuration: '800ms',
                                            transitionDelay: `${idx * 100}ms`,
                                        }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Centered Total Summary */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#0E2038] dark:text-white tracking-tight font-mono">
                                {hoveredIndex !== null
                                    ? current.segments[hoveredIndex].value
                                    : current.total}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-[#8EB0CF] uppercase tracking-wider">
                                {hoveredIndex !== null
                                    ? current.segments[hoveredIndex].name
                                    : current.title}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Legend List (Right) */}
                <div className="sm:col-span-6 space-y-2">
                    {current.segments.map((seg, idx) => {
                        const isHovered = hoveredIndex === idx;
                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                                    isHovered
                                        ? 'bg-[#FDFBF5] dark:bg-[#071324] border border-[#F5E7C2] dark:border-[#D4AF37]/40 shadow-2xs'
                                        : 'hover:bg-slate-50 dark:hover:bg-[#071324]/50 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: seg.color }}
                                    ></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                        {seg.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs shrink-0 pl-2">
                                    <span className="font-extrabold text-[#0E2038] dark:text-white font-mono">
                                        {seg.percent}%
                                    </span>
                                    <span className="text-slate-400 dark:text-[#5E8CB6] font-mono text-[11px]">
                                        ({seg.value})
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Status Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1C3E63]/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-[#8EB0CF]">Active Product Categories</span>
                <span className="font-bold text-[#926F18] dark:text-[#EBD495]">100% Taxonomies Mapped</span>
            </div>
        </div>
    );
}
