'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
  Tooltip,
} from 'recharts';
import { ScoreBreakdown } from '@/lib/api';

interface Props {
  scoreBreakdown: ScoreBreakdown | null;
}

const BARS = [
  { key: 'keyword' as const, label: 'Keyword', color: '#4f8fff' },
  { key: 'bm25' as const, label: 'BM25', color: '#a855f7' },
  { key: 'cosine' as const, label: 'Cosine', color: '#22d45a' },
  { key: 'experience' as const, label: 'Experience', color: '#f5c518' },
  { key: 'hardFilter' as const, label: 'Hard Filter', color: '#ff4444' },
];

interface TooltipPayload {
  name?: string;
  value?: number;
  payload?: { color: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-[#0e0e14] border border-[#2d2d3e] px-3 py-2 font-mono text-[11px] shadow-lg">
      <span style={{ color: entry?.payload?.color ?? '#fff' }}>
        {entry?.name}: {entry?.value}%
      </span>
    </div>
  );
}

export default function ScoreBarChart({ scoreBreakdown }: Props) {
  if (!scoreBreakdown) return null;

  const data = BARS.map(({ key, label, color }) => ({
    name: label,
    value: Math.round((scoreBreakdown[key] ?? 0) * 100),
    color,
  }));

  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: 68 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{
              fill: '#52525b',
              fontSize: 9,
              fontFamily: "'Space Mono', monospace",
            }}
            axisLine={{ stroke: '#2d2d3e' }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{
              fill: '#a1a1aa',
              fontSize: 10,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
            }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="value" radius={0} maxBarSize={16}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => `${v as number}%`}
              style={{
                fill: '#a1a1aa',
                fontSize: 10,
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
