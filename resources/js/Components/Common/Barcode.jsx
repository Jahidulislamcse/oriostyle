import React, { useMemo } from 'react';

const CODE39 = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
    '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
};

export default function Barcode({
    value = '',
    height = 42,
    showText = true,
    className = '',
}) {
    const bars = useMemo(() => {
        const cleanVal = (value || '').toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '');
        if (!cleanVal) return [];

        const fullStr = `*${cleanVal}*`;
        const rects = [];
        let currentX = 0;
        const narrowWidth = 1.6;
        const wideWidth = 3.8;

        for (let i = 0; i < fullStr.length; i++) {
            const char = fullStr[i];
            const pattern = CODE39[char] || CODE39['-'];

            for (let b = 0; b < 9; b++) {
                const isBar = b % 2 === 0;
                const isWide = pattern[b] === '1';
                const width = isWide ? wideWidth : narrowWidth;

                if (isBar) {
                    rects.push({
                        x: currentX,
                        width: width,
                    });
                }
                currentX += width;
            }

            // Inter-character narrow gap
            currentX += narrowWidth;
        }

        return { rects, totalWidth: currentX, text: cleanVal };
    }, [value]);

    if (!bars || !bars.rects || bars.rects.length === 0) {
        return null;
    }

    return (
        <div className={`inline-flex flex-col items-center select-none ${className}`}>
            <svg
                width={Math.ceil(bars.totalWidth)}
                height={height}
                viewBox={`0 0 ${bars.totalWidth} ${height}`}
                className="overflow-visible"
                style={{ shapeRendering: 'crispEdges' }}
            >
                {bars.rects.map((r, idx) => (
                    <rect
                        key={idx}
                        x={r.x}
                        y={0}
                        width={r.width}
                        height={height}
                        fill="#000000"
                    />
                ))}
            </svg>
            {showText && (
                <span className="font-mono text-[10px] tracking-widest text-slate-700 mt-1 uppercase font-semibold">
                    *{bars.text}*
                </span>
            )}
        </div>
    );
}
