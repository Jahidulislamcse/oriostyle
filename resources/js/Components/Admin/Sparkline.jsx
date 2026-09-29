import React from 'react';

export default function Sparkline({
    data = [12, 18, 15, 25, 22, 35, 30, 45],
    color = '#D4AF37',
    height = 36,
    strokeWidth = 2,
    fillOpacity = 0.15,
    className = '',
}) {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    const width = 120;
    const padding = 4;

    const points = data.map((val, idx) => {
        const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((val - min) / range) * (height - padding * 2);
        return [x, y];
    });

    // Create smooth SVG cubic bezier path
    const getSvgPath = () => {
        if (points.length < 2) return '';
        let d = `M ${points[0][0]},${points[0][1]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i - 1] : points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = i != points.length - 2 ? points[i + 2] : p2;

            const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
            const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
            const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
            const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
        }
        return d;
    };

    const linePath = getSvgPath();
    const areaPath = `${linePath} L ${points[points.length - 1][0]},${height} L ${points[0][0]},${height} Z`;
    const lastPoint = points[points.length - 1];
    const gradientId = `sparkline-grad-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 5)}`;

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area Fill with fade */}
                <path d={areaPath} fill={`url(#${gradientId})`} />

                {/* Animated Line Stroke */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-700 ease-out"
                />

                {/* Last Pulsing Indicator Point */}
                {lastPoint && (
                    <g>
                        <circle
                            cx={lastPoint[0]}
                            cy={lastPoint[1]}
                            r="4"
                            fill={color}
                            className="animate-ping opacity-60 origin-center"
                        />
                        <circle
                            cx={lastPoint[0]}
                            cy={lastPoint[1]}
                            r="2.5"
                            fill={color}
                            className="stroke-white dark:stroke-[#0E2038]"
                            strokeWidth="1"
                        />
                    </g>
                )}
            </svg>
        </div>
    );
}
