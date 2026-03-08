'use client';
import { useEffect, useRef } from 'react';

interface Props {
  score: number;
  animate?: boolean;
}

function getColor(s: number) {
  if (s >= 75)
    return {
      stroke: '#22d45a',
      text: '#22d45a',
      glow: 'rgba(34,212,90,0.35)',
      label: 'EXCELLENT',
      css: 'score-glow-green',
    };
  if (s >= 50)
    return {
      stroke: '#f5c518',
      text: '#f5c518',
      glow: 'rgba(245,197,24,0.35)',
      label: 'AVERAGE',
      css: 'score-glow-yellow',
    };
  return {
    stroke: '#ff4444',
    text: '#ff4444',
    glow: 'rgba(255,68,68,0.35)',
    label: 'POOR',
    css: 'score-glow-red',
  };
}

export default function ATSScoreRing({ score, animate = true }: Props) {
  const ref = useRef<SVGCircleElement>(null);
  const R = 68;
  const C = 2 * Math.PI * R;
  const offset = C - (score / 100) * C;
  const { stroke, text, glow, label, css } = getColor(score);

  useEffect(() => {
    if (!animate || !ref.current) return;
    const el = ref.current;
    el.style.strokeDashoffset = String(C);
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
      el.style.strokeDashoffset = String(offset);
    });
  }, [score, animate, C, offset]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative" style={{ width: 180, height: 180 }}>
        {/* Square glow border */}
        <div
          className="absolute inset-0 border"
          style={{ borderColor: `${stroke}25`, boxShadow: `0 0 32px ${glow}` }}
        />

        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Fill */}
          <circle
            ref={ref}
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="square"
            strokeDasharray={C}
            strokeDashoffset={animate ? C : offset}
            className={css}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-bold tabular-nums leading-none"
            style={{
              fontSize: 50,
              color: text,
              textShadow: `0 0 20px ${glow}`,
            }}
          >
            {score}
          </span>
          <span className="font-mono text-xs text-zinc-500 mt-1 tracking-wide">
            / 100
          </span>
        </div>
      </div>

      {/* Label */}
      <div
        className="text-center"
        style={{
          borderTop: `1px solid ${stroke}30`,
          paddingTop: 12,
          width: '100%',
        }}
      >
        <p
          className="font-mono font-bold text-xs tracking-[0.15em]"
          style={{ color: stroke }}
        >
          {label}
        </p>
        <p className="font-mono text-[10px] text-zinc-500 mt-1 tracking-wider">
          ATS COMPATIBILITY
        </p>
      </div>
    </div>
  );
}
