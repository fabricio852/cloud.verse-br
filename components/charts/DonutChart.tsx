
import React, { useState } from 'react';
// FIX: Imported Domain from `types.ts` instead of `constants.ts`.
import { DONUT_COLORS } from '../../constants';
import { Domain } from '../../types';

interface DonutChartProps {
    data: { key: Domain; value: number }[];
    size?: number;
    thickness?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, size = 240, thickness = 28 }) => {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const total = data.reduce((s, d) => s + Math.max(0, d.value || 0), 0) || 1;
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
                <circle r={r} cx="0" cy="0" fill="none" stroke="#e5e7eb" strokeWidth={thickness} className="dark:stroke-gray-700"/>
                {data.map((d, idx) => {
                    const val = Math.max(0, d.value || 0);
                    const frac = val / total;
                    const len = frac * c;
                    const el = (
                        <circle
                            key={d.key}
                            r={r}
                            cx="0"
                            cy="0"
                            fill="none"
                            stroke={DONUT_COLORS[d.key]}
                            strokeWidth={hoverIdx === idx ? (thickness + 4) : thickness}
                            strokeDasharray={`${len} ${c - len}`}
                            strokeDashoffset={-offset}
                            strokeOpacity={hoverIdx === null || hoverIdx === idx ? 1 : 0.35}
                            style={{ transition: 'stroke-dashoffset 600ms ease, stroke-width 150ms ease, stroke-opacity 150ms ease' }}
                            onMouseEnter={() => setHoverIdx(idx)}
                            onMouseLeave={() => setHoverIdx(null)}
                        />
                    );
                    offset += len;
                    return el;
                })}
            </g>
        </svg>
    );
};
