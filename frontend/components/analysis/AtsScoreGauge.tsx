'use client';

import { useEffect, useRef } from 'react';

interface Props {
  score: number;
}

function getColor(s: number) {
  if (s >= 75)
    return {
      stroke: '#22d45a',
      glow: 'rgba(34,212,90,0.4)',
      grade: 'A',
      label: 'EXCELLENT',
    };
  if (s >= 50)
    return {
      stroke: '#f5c518',
      glow: 'rgba(245,197,24,0.4)',
      grade: 'B',
      label: 'AVERAGE',
    };
  return {
    stroke: '#ff4444',
    glow: 'rgba(255,68,68,0.4)',
    grade: 'C',
    label: 'POOR',
  };
}

export default function AtsScoreGauge({ score }: Props) {
  const arcRef = useRef<SVGPathElement>(null);

  // Half-circle arc: cx=100, cy=100, r=72
  // Starts at 180° (left) ends at 0° (right) — top half
  const R = 72;
  const cx = 100;
  const cy = 100;
  const totalLength = Math.PI * R; // half-circle arc length ≈ 226.2
  const filled = (score / 100) * totalLength;

  const { stroke, glow, grade, label } = getColor(score);

  // SVG arc path: from left (180°) to right (0°) — counterclockwise = top half
  const startX = cx - R;
  const startY = cy;
  const endX = cx + R;
  const endY = cy;
  const arcPath = `M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`;

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    el.style.strokeDasharray = `${totalLength}`;
    el.style.strokeDashoffset = `${totalLength}`;
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)';
      el.style.strokeDashoffset = `${totalLength - filled}`;
    });
    return () => cancelAnimationFrame(raf);
  }, [score, totalLength, filled]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 110 }}>
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* Track */}
          <path
            d={arcPath}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Fill arc */}
          <path
            ref={arcRef}
            d={arcPath}
            fill="none"
            stroke={stroke}
            strokeWidth={12}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className="font-mono font-bold tabular-nums leading-none"
            style={{
              fontSize: 36,
              color: stroke,
              textShadow: `0 0 18px ${glow}`,
            }}
          >
            {score}
          </span>
          <span className="font-mono text-[10px] text-zinc-500 tracking-wider mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge + label */}
      <div className="flex items-center gap-3 mt-2">
        <span
          className="font-mono font-bold text-lg w-8 h-8 flex items-center justify-center border"
          style={{
            color: stroke,
            borderColor: `${stroke}50`,
            background: `${stroke}10`,
          }}
        >
          {grade}
        </span>
        <div className="text-left">
          <p
            className="font-mono font-bold text-xs tracking-[0.14em]"
            style={{ color: stroke }}
          >
            {label}
          </p>
          <p className="font-mono text-[9px] text-zinc-500 tracking-wider">
            ATS COMPATIBILITY
          </p>
        </div>
      </div>
    </div>
  );
}
