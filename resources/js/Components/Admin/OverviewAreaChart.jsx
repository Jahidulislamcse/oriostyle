import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

export default function OverviewAreaChart({ currency = '৳' }) {
    const [timeframe, setTimeframe] = useState('7d');
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isAnimated, setIsAnimated] = useState(false);

    const datasets = {
        '7d': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            dates: ['Sep 23', 'Sep 24', 'Sep 25', 'Sep 26', 'Sep 27', 'Sep 28', 'Sep 29'],
            series1: [1800, 2600, 3900, 3100, 4800, 5600, 6400], // Gross Sales (৳)
            series2: [1200, 1900, 2700, 2200, 3600, 4200, 5100], // Delivered / Net (৳)
            orders: [12, 18, 26, 21, 32, 38, 44],
            totalSales: '28,200',
            growth: '+18.4%',
        },
        '30d': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            dates: ['Sep 1-7', 'Sep 8-14', 'Sep 15-21', 'Sep 22-29'],
            series1: [18500, 24300, 29800, 36400],
            series2: [14200, 19500, 23900, 30100],
            orders: [124, 168, 204, 252],
            totalSales: '109,000',
            growth: '+24.6%',
        },
        '12m': {
            labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
            dates: ['Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026', 'Sep 2026', 'Nov 2026'],
            series1: [45000, 62000, 78000, 95000, 120000, 145000],
            series2: [36000, 49000, 63000, 79000, 98000, 122000],
            orders: [310, 440, 560, 690, 880, 1050],
            totalSales: '545,000',
            growth: '+42.1%',
        },
    };

    const currentData = datasets[timeframe] || datasets['7d'];

    // Trigger stroke animation on mount or timeframe change
    useEffect(() => {
        setIsAnimated(false);
        const timer = setTimeout(() => setIsAnimated(true), 50);
        return () => clearTimeout(timer);
    }, [timeframe]);

    const maxVal = Math.max(...currentData.series1, ...currentData.series2) * 1.15 || 1000;
    const width = 600;
    const height = 240;
    const padding = { top: 20, right: 25, bottom: 35, left: 45 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const getX = (index) => {
        const count = currentData.labels.length;
        return padding.left + (index / (count - 1)) * chartWidth;
    };

    const getY = (val) => {
        return height - padding.bottom - (val / maxVal) * chartHeight;
    };

    // Generate smooth bezier curve path
    const generateSplinePath = (series) => {
        const points = series.map((val, idx) => [getX(idx), getY(val)]);
        if (points.length < 2) return '';

        let d = `M ${points[0][0]},${points[0][1]}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i - 1] : points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = i !== points.length - 2 ? points[i + 2] : p2;

            const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
            const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
            const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
            const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
        }
        return d;
    };

    const path1 = generateSplinePath(currentData.series1);
    const path2 = generateSplinePath(currentData.series2);

    const areaPath1 = `${path1} L ${getX(currentData.series1.length - 1)},${height - padding.bottom} L ${getX(0)},${height - padding.bottom} Z`;
    const areaPath2 = `${path2} L ${getX(currentData.series2.length - 1)},${height - padding.bottom} L ${getX(0)},${height - padding.bottom} Z`;

    const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

    return (
        <div className="bg-white dark:bg-[#0E2038] border border-slate-200 dark:border-[#1C3E63]/70 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            {/* Header with Title & Timeframe Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 dark:border-[#1C3E63]/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FDFBF5] text-[#926F18] dark:bg-[#071324] dark:text-[#EBD495] border border-[#F5E7C2] dark:border-[#D4AF37]/40 shrink-0">
                        <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-[#0E2038] dark:text-white tracking-tight">
                            Sales & Order Performance
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#8EB0CF]">
                            Total revenue trajectory & fulfilled volume overview
                        </p>
                    </div>
                </div>

                {/* Series Legend & Filter Controls */}
                <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
                    <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] shadow-xs"></span>
                            <span>Total Sales</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-xs"></span>
                            <span>Delivered</span>
                        </span>
                    </div>

                    <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#071324] p-1 border border-slate-200 dark:border-[#1C3E63]">
                        {[
                            { id: '7d', label: '7 Days' },
                            { id: '30d', label: '30 Days' },
                            { id: '12m', label: '12 Mo' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => setTimeframe(btn.id)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                                    timeframe === btn.id
                                        ? 'bg-white dark:bg-[#142C49] text-[#926F18] dark:text-[#EBD495] shadow-2xs'
                                        : 'text-slate-500 dark:text-[#8EB0CF] hover:text-[#0E2038] dark:hover:text-white'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interactive SVG Chart Container */}
            <div className="relative w-full aspect-[2.4/1] min-h-[220px] select-none">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        {/* Blue Gradient Area */}
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.28" />
                            <stop offset="95%" stopColor="#0284C7" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Emerald Gradient Area */}
                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                            <stop offset="95%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Grid Line Filter */}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    {yTicks.map((tick, i) => {
                        const y = getY(tick);
                        return (
                            <g key={i}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={width - padding.right}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeDasharray="4 4"
                                    className="text-slate-100 dark:text-[#1C3E63]/50"
                                    strokeWidth="1"
                                />
                                <text
                                    x={padding.left - 8}
                                    y={y + 3.5}
                                    textAnchor="end"
                                    className="text-[10px] font-mono fill-slate-400 dark:fill-[#5E8CB6]"
                                >
                                    {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick.toFixed(0)}
                                </text>
                            </g>
                        );
                    })}

                    {/* X Axis Labels */}
                    {currentData.labels.map((label, idx) => {
                        const x = getX(idx);
                        return (
                            <text
                                key={idx}
                                x={x}
                                y={height - 10}
                                textAnchor="middle"
                                className="text-[11px] font-semibold fill-slate-500 dark:fill-[#8EB0CF]"
                            >
                                {label}
                            </text>
                        );
                    })}

                    {/* Series 1 (Total Sales - Blue) Area & Animated Line */}
                    <path
                        d={areaPath1}
                        fill="url(#blueGradient)"
                        className={`transition-opacity duration-700 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <path
                        d={path1}
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Series 2 (Delivered - Emerald) Area & Animated Line */}
                    <path
                        d={areaPath2}
                        fill="url(#emeraldGradient)"
                        className={`transition-opacity duration-700 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <path
                        d={path2}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-1000 ease-out ${isAnimated ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Hover vertical crosshair & interaction zones */}
                    {currentData.labels.map((_, idx) => {
                        const x = getX(idx);
                        const isHovered = hoveredIndex === idx;
                        const y1 = getY(currentData.series1[idx]);
                        const y2 = getY(currentData.series2[idx]);

                        return (
                            <g key={idx}>
                                {/* Transparent wide hit area for easy hover on touch & mouse */}
                                <rect
                                    x={x - chartWidth / (currentData.labels.length * 2)}
                                    y={padding.top}
                                    width={chartWidth / currentData.labels.length}
                                    height={chartHeight}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onTouchStart={() => setHoveredIndex(idx)}
                                />

                                {/* Vertical guideline on hover */}
                                {isHovered && (
                                    <line
                                        x1={x}
                                        y1={padding.top}
                                        x2={x}
                                        y2={height - padding.bottom}
                                        stroke="#D4AF37"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                        className="opacity-70 animate-pulse"
                                    />
                                )}

                                {/* Series 1 Point (Blue) */}
                                <circle
                                    cx={x}
                                    cy={y1}
                                    r={isHovered ? 6 : 4}
                                    fill="#0284C7"
                                    stroke="#FFFFFF"
                                    strokeWidth={isHovered ? 2.5 : 1.5}
                                    className={`transition-all duration-200 ${isHovered ? 'scale-125' : ''}`}
                                />

                                {/* Series 2 Point (Emerald) */}
                                <circle
                                    cx={x}
                                    cy={y2}
                                    r={isHovered ? 6 : 4}
                                    fill="#10B981"
                                    stroke="#FFFFFF"
                                    strokeWidth={isHovered ? 2.5 : 1.5}
                                    className={`transition-all duration-200 ${isHovered ? 'scale-125' : ''}`}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Interactive Tooltip Card Overlay */}
                {hoveredIndex !== null && (
                    <div
                        className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[#0E2038] text-white p-3 rounded-xl shadow-xl border border-[#D4AF37]/60 text-xs transition-all duration-150 animate-in fade-in zoom-in-95"
                        style={{
                            left: `${(getX(hoveredIndex) / width) * 100}%`,
                            top: `${Math.min(
                                (getY(currentData.series1[hoveredIndex]) / height) * 100,
                                (getY(currentData.series2[hoveredIndex]) / height) * 100
                            )}%`,
                        }}
                    >
                        <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-[#1C3E63]">
                            <span className="font-extrabold text-[#F5D77F]">
                                {currentData.dates[hoveredIndex]}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#071324] text-emerald-400 border border-emerald-500/30">
                                {currentData.orders[hoveredIndex]} Orders
                            </span>
                        </div>
                        <div className="mt-1.5 space-y-1">
                            <div className="flex items-center justify-between gap-3 text-slate-300">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                                    <span>Total Sales:</span>
                                </span>
                                <span className="font-bold text-white font-mono">
                                    {currency}{currentData.series1[hoveredIndex].toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-slate-300">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                                    <span>Delivered:</span>
                                </span>
                                <span className="font-bold text-emerald-300 font-mono">
                                    {currency}{currentData.series2[hoveredIndex].toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Quick Metric Highlights */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1C3E63]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 dark:text-[#8EB0CF]">Period Turnover:</span>
                    <span className="font-extrabold text-[#0E2038] dark:text-white font-mono">
                        {currency}{currentData.totalSales}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    <span>{currentData.growth}</span> vs previous period
                </div>
            </div>
        </div>
    );
}
