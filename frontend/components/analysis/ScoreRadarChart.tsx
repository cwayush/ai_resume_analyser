'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ScoreBreakdown } from '@/lib/api';

interface Props {
  scoreBreakdown: ScoreBreakdown | null;
}

const METRICS = [
  { key: 'keyword' as const, label: 'Keyword' },
  { key: 'bm25' as const, label: 'BM25' },
  { key: 'cosine' as const, label: 'Cosine' },
  { key: 'experience' as const, label: 'Exp.' },
  { key: 'hardFilter' as const, label: 'Hard Filter' },
];

interface TooltipPayload {
  payload?: { value: number; metric: string };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div
      style={{
        background: '#0e0e14',
        border: '1px solid #2d2d3e',
        padding: '8px 12px',
        fontSize: 12,
        boxShadow: '3px 3px 0 #000',
      }}
    >
      <p style={{ color: '#a1a1aa', fontSize: 11, marginBottom: 2 }}>
        {item?.metric}
      </p>
      <p style={{ color: '#4f8fff', fontWeight: 700 }}>{item?.value}%</p>
    </div>
  );
}

export default function ScoreRadarChart({ scoreBreakdown }: Props) {
  if (!scoreBreakdown) return null;

  const data = METRICS.map(({ key, label }) => ({
    metric: label,
    value: Math.round((scoreBreakdown[key] ?? 0) * 100),
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
        >
          <PolarGrid stroke="rgba(255,255,255,0.07)" gridType="polygon" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#4f8fff"
            fill="#4f8fff"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ fill: '#4f8fff', r: 3, strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
