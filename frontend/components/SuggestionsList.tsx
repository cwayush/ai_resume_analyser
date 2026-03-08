'use client';
import { Suggestion } from '@/lib/api';

interface Props {
  suggestions: Suggestion[];
}

const P_CFG = {
  high: {
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.07)',
    border: 'rgba(220,38,38,0.2)',
    left: '#dc2626',
    label: 'HIGH',
  },
  medium: {
    color: '#ca8a04',
    bg: 'rgba(202,138,4,0.07)',
    border: 'rgba(202,138,4,0.2)',
    left: '#ca8a04',
    label: 'MED',
  },
  low: {
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.07)',
    border: 'rgba(37,99,235,0.2)',
    left: '#2563eb',
    label: 'LOW',
  },
};

export default function SuggestionsList({ suggestions }: Props) {
  if (!suggestions || suggestions.length === 0) return null;
  const ord = { high: 0, medium: 1, low: 2 };
  const sorted = [...suggestions].sort(
    (a, b) => ord[a.priority] - ord[b.priority],
  );

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((s, i) => {
        const cfg = P_CFG[s.priority];
        return (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-xl animate-fadeIn transition-colors"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderLeft: `3px solid ${cfg.left}`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {/* Index */}
            <div
              className="shrink-0 w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-md"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
              }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: 'var(--color-ink-300)' }}
                >
                  {s.category}
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    color: cfg.color,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-ink-700)' }}
              >
                {s.suggestion}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
