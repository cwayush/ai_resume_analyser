'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  GitBranch,
  BarChart3,
  Briefcase,
  Target,
  Lightbulb,
} from 'lucide-react';
import { getAnalysis, Analysis, ScoreBreakdown } from '@/lib/api';
import ATSScoreRing from '@/components/ATSScoreRing';
import KeywordBadges from '@/components/KeywordBadges';
import SkillsMatch from '@/components/SkillsMatch';
import SuggestionsList from '@/components/SuggestionsList';
import ScoreRadarChart from '@/components/analysis/ScoreRadarChart';
import SkillComparison from '@/components/analysis/SkillComparison';
import CosineSimilarityChart from '@/components/analysis/CosineSimilarityChart';

/* ── Section card wrapper ────────────────────────────────────── */
function Section({
  title,
  icon: Icon,
  accent = 'var(--color-gold)',
  children,
  delay = 0,
}: {
  title: string;
  icon?: React.ElementType;
  accent?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="animate-fadeUp overflow-hidden rounded-2xl"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          borderBottom: '1px solid var(--color-border)',
          borderLeft: `3px solid ${accent}`,
          background: 'var(--color-surface-2)',
        }}
      >
        {Icon && <Icon size={14} style={{ color: accent }} />}
        <h2
          className="font-bold text-xs tracking-[0.1em] uppercase"
          style={{ color: accent }}
        >
          {title}
        </h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/* ── Score bar ───────────────────────────────────────────────── */
function ScoreBar({
  label,
  value,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  delay?: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.round(value * 100)), 200 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span
          className="text-xs font-bold tracking-[0.06em] uppercase"
          style={{ color: 'var(--color-ink-500)' }}
        >
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {w}%
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full overflow-hidden"
        style={{ background: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${w}%`,
            background: color,
            boxShadow: `0 0 8px ${color}50`,
            transitionDuration: '0.95s',
            transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Match chip ──────────────────────────────────────────────── */
function MatchChip({
  label,
  match,
  notes,
}: {
  label: string;
  match: boolean;
  notes: string;
}) {
  const color = match ? '#16a34a' : '#dc2626';
  const bg = match ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.07)';
  const border = match ? 'rgba(22,163,74,0.22)' : 'rgba(220,38,38,0.22)';
  const left = match ? '#16a34a' : '#dc2626';
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderLeft: `3px solid ${left}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {match ? (
          <CheckCircle2 size={13} style={{ color }} />
        ) : (
          <XCircle size={13} style={{ color }} />
        )}
        <span
          className="text-[10px] font-bold tracking-[0.12em] uppercase"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'var(--color-ink-500)' }}
      >
        {notes || '—'}
      </p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalysis(id)
      .then(setData)
      .catch(() => setError('Could not load analysis'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: 'var(--color-border)',
            borderTopColor: 'var(--color-gold)',
          }}
        />
        <p
          className="text-[11px] font-semibold tracking-[0.1em]"
          style={{ color: 'var(--color-ink-300)' }}
        >
          Loading analysis…
        </p>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-5">
        <XCircle size={40} style={{ color: '#dc2626' }} />
        <p className="text-sm" style={{ color: 'var(--color-ink-500)' }}>
          {error || 'Analysis not found'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-5 h-9 text-xs font-semibold rounded-lg transition-colors"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink-500)',
          }}
        >
          ← Go Home
        </button>
      </div>
    );

  const date = new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const engines = [
    {
      label: 'Keyword Match',
      key: 'keyword' as const,
      color: 'var(--color-neon-blue)',
    },
    {
      label: 'BM25 Relevance',
      key: 'bm25' as const,
      color: 'var(--color-neon-purple)',
    },
    {
      label: 'Cosine Similarity',
      key: 'cosine' as const,
      color: 'var(--color-neon-green)',
    },
    {
      label: 'Experience',
      key: 'experience' as const,
      color: 'var(--color-neon-yellow)',
    },
    {
      label: 'Hard Filter',
      key: 'hardFilter' as const,
      color: 'var(--color-neon-red)',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-16">
      {/* Breadcrumb bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 mb-6 rounded-2xl animate-fadeIn"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-semibold rounded-lg transition-colors shrink-0"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-ink-500)',
              background: 'var(--color-surface-2)',
            }}
          >
            <ArrowLeft size={12} /> Back
          </Link>
          <div
            className="w-px h-5"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="min-w-0">
            <h1
              className="font-bold text-sm tracking-wide uppercase truncate"
              style={{ color: 'var(--color-ink-900)' }}
            >
              {data.jobTitle || 'Analysis Results'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {data.companyName && data.companyName !== 'Not Specified' && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--color-ink-500)' }}
                >
                  <Building size={10} /> {data.companyName}
                </span>
              )}
              {data.fileName && (
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--color-ink-300)' }}
                >
                  <FileText size={10} /> {data.fileName}
                </span>
              )}
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--color-ink-300)' }}
              >
                <Calendar size={10} /> {date}
              </span>
              {data.pipelineVersion && (
                <span
                  className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(37,99,235,0.08)',
                    border: '1px solid rgba(37,99,235,0.2)',
                    color: 'var(--color-neon-blue)',
                  }}
                >
                  <GitBranch size={8} /> {data.pipelineVersion}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/history"
          className="hidden sm:inline-flex items-center px-4 h-8 text-xs font-semibold rounded-lg transition-colors shrink-0"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink-500)',
            background: 'var(--color-surface-2)',
          }}
        >
          History
        </Link>
      </div>

      {/* Score + AI Feedback */}
      <div
        className="grid grid-cols-1 md:grid-cols-[260px_1fr] mb-6 animate-fadeUp rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}
      >
        {/* Score ring */}
        <div
          className="flex flex-col items-center justify-center p-8"
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-gold-bg)',
          }}
        >
          <ATSScoreRing score={data.atsScore} />
        </div>

        {/* AI Analysis */}
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target size={13} style={{ color: 'var(--color-gold)' }} />
              <span
                className="font-bold text-[10px] tracking-[0.14em] uppercase"
                style={{ color: 'var(--color-gold)' }}
              >
                AI Analysis
              </span>
            </div>
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--color-ink-700)' }}
            >
              {data.overallFeedback ||
                'Score computed deterministically from 5 engines. Add a Gemini API key in your .env to receive coaching feedback.'}
            </p>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-5"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <MatchChip
              label="Experience"
              match={!!data.experienceMatch?.match}
              notes={data.experienceMatch?.notes || ''}
            />
            <MatchChip
              label="Education"
              match={!!data.educationMatch?.match}
              notes={data.educationMatch?.notes || ''}
            />
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {data.scoreBreakdown && (
        <div className="mb-6">
          <Section
            title="Score Breakdown"
            icon={BarChart3}
            accent="var(--color-neon-blue)"
            delay={0.1}
          >
            <p
              className="text-[12px] mb-6 tracking-wide"
              style={{ color: 'var(--color-ink-300)' }}
            >
              Deterministic &nbsp;·&nbsp; Same inputs → identical score
              &nbsp;·&nbsp; Pipeline{' '}
              <span style={{ color: 'var(--color-neon-blue)' }}>v2.0.0</span>
            </p>
            {engines.map((e, i) => (
              <ScoreBar
                key={e.key}
                label={e.label}
                value={(data.scoreBreakdown as ScoreBreakdown)[e.key] ?? 0}
                color={e.color}
                delay={i * 100}
              />
            ))}
            <div className="pt-4 flex items-center justify-center mt-2">
              <span
                className="text-[11px]"
                style={{ color: 'var(--color-ink-300)' }}
              >
                KW: 35% &nbsp;|&nbsp; BM25: 25% &nbsp;|&nbsp; COS: 25%
                &nbsp;|&nbsp; EXP: 10% &nbsp;|&nbsp; HF: 5%
              </span>
            </div>
          </Section>
        </div>
      )}

      {/* Keywords + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Section
          title="Keyword Analysis"
          icon={Briefcase}
          accent="var(--color-neon-green)"
          delay={0.2}
        >
          <KeywordBadges
            matched={data.matchedKeywords || []}
            missing={data.missingKeywords || []}
          />
        </Section>
        <Section
          title="Skills Matrix"
          icon={CheckCircle2}
          accent="var(--color-neon-purple)"
          delay={0.25}
        >
          <SkillsMatch skillsMatch={data.skillsMatch} />
        </Section>
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <Section
          title="Improvement Suggestions"
          icon={Lightbulb}
          accent="var(--color-neon-yellow)"
          delay={0.3}
        >
          <SuggestionsList suggestions={data.suggestions || []} />
        </Section>
      </div>

      {/* ── Visual Analysis ───────────────────────────────────────── */}
      {(data.scoreBreakdown || data.skillsMatch) && (
        <div className="mb-10 space-y-5">
          {data.scoreBreakdown && (
            <Section
              title="Score Radar"
              icon={BarChart3}
              accent="var(--color-neon-blue)"
              delay={0.35}
            >
              <ScoreRadarChart scoreBreakdown={data.scoreBreakdown} />
            </Section>
          )}
          {data.scoreBreakdown && (
            <Section
              title="JD vs Resume · Vector Similarity"
              icon={GitBranch}
              accent="var(--color-neon-green)"
              delay={0.4}
            >
              <CosineSimilarityChart scoreBreakdown={data.scoreBreakdown} />
            </Section>
          )}
          {data.skillsMatch && (
            <Section
              title="Skills Comparison"
              icon={CheckCircle2}
              accent="var(--color-neon-purple)"
              delay={0.45}
            >
              <SkillComparison skillsMatch={data.skillsMatch} />
            </Section>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 h-12 text-sm font-bold rounded-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #c9972b, #f0c860)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(201,151,43,0.35)',
          }}
        >
          Analyze Another
        </Link>
        <Link
          href="/history"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 h-12 text-sm font-semibold rounded-xl transition-colors"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink-500)',
          }}
        >
          View All Analyses
        </Link>
      </div>
    </div>
  );
}
