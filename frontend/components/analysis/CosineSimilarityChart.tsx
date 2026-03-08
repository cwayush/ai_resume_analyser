'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { ScoreBreakdown } from '@/lib/api';

interface Props {
  scoreBreakdown: ScoreBreakdown | null;
  cosineScore?: number;
}

const DIMENSIONS = [
  { key: 'keyword' as const, label: 'Keyword' },
  { key: 'bm25' as const, label: 'BM25' },
  { key: 'cosine' as const, label: 'Cosine' },
  { key: 'experience' as const, label: 'Experience' },
  { key: 'hardFilter' as const, label: 'Hard Filter' },
];

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0e0e14',
        border: '1px solid #2d2d3e',
        borderRadius: 0,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '3px 3px 0 #000',
      }}
    >
      <p style={{ color: '#a1a1aa', marginBottom: 6, fontSize: 11 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value}%</strong>
        </p>
      ))}
    </div>
  );
}

export default function CosineSimilarityChart({ scoreBreakdown }: Props) {
  if (!scoreBreakdown) return null;

  // JD "expected" profile — treat 100% as the ideal target on every dimension.
  // Resume profile is the actual normalized scores.
  const data = DIMENSIONS.map(({ key, label }) => ({
    label,
    'JD Required': 100,
    'Your Resume': Math.round((scoreBreakdown[key] ?? 0) * 100),
  }));

  // Overall cosine similarity (raw value * 100)
  const cosinePct = Math.round((scoreBreakdown.cosine ?? 0) * 100);

  return (
    <div>
      {/* Subtitle */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ color: '#71717a', fontSize: 12, lineHeight: 1.6 }}>
            Plots your resume&apos;s score profile (solid line) against the
            JD&apos;s ideal target (dashed). The closer the lines, the higher
            the semantic similarity.
          </p>
        </div>
        <div
          style={{
            padding: '6px 14px',
            background: 'rgba(79,143,255,0.1)',
            border: '1px solid rgba(79,143,255,0.3)',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <p style={{ color: '#71717a', fontSize: 10, marginBottom: 2 }}>
            COSINE SIMILARITY
          </p>
          <p style={{ color: '#4f8fff', fontSize: 22, fontWeight: 700 }}>
            {cosinePct}%
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
          >
            <defs>
              <linearGradient id="jdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f8fff" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#4f8fff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resumeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d45a" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#22d45a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#52525b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8, color: '#a1a1aa' }}
              iconType="circle"
              iconSize={8}
            />

            {/* Cosine score reference line */}
            <ReferenceLine
              y={cosinePct}
              stroke="rgba(79,143,255,0.3)"
              strokeDasharray="3 5"
              label={{
                value: `cosine ${cosinePct}%`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'rgba(79,143,255,0.6)',
              }}
            />

            {/* JD ideal — dashed flat line at 100% */}
            <Area
              type="monotone"
              dataKey="JD Required"
              stroke="#4f8fff"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              fill="url(#jdGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#4f8fff' }}
            />

            {/* Resume actual */}
            <Area
              type="monotone"
              dataKey="Your Resume"
              stroke="#22d45a"
              strokeWidth={2}
              fill="url(#resumeGrad)"
              dot={{ r: 4, fill: '#22d45a', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#22d45a', stroke: '#22d45a26' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
