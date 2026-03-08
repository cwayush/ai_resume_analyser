'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyses, deleteAnalysis, AnalysisSummary } from '@/lib/api';
import {
  Trash2,
  ArrowRight,
  FileText,
  Building2,
  Clock,
  Plus,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Score badge ─────────────────────────────────────────────── */
function ScoreBadge({ score }: { score: number }) {
  const isHigh = score >= 75,
    isMid = score >= 50;
  const color = isHigh ? '#16a34a' : isMid ? '#ca8a04' : '#dc2626';
  const bg = isHigh
    ? 'rgba(22,163,74,0.08)'
    : isMid
      ? 'rgba(202,138,4,0.08)'
      : 'rgba(220,38,38,0.08)';
  const border = isHigh
    ? 'rgba(22,163,74,0.25)'
    : isMid
      ? 'rgba(202,138,4,0.25)'
      : 'rgba(220,38,38,0.25)';
  const label = isHigh ? 'EXCELLENT' : isMid ? 'AVERAGE' : 'POOR';

  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center gap-1 rounded-xl"
      style={{
        width: 72,
        height: 72,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <span
        className="font-extrabold tabular-nums leading-none"
        style={{ fontSize: 28, color }}
      >
        {score}
      </span>
      <span
        className="font-bold tracking-widest"
        style={{ fontSize: 8, color, opacity: 0.75 }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Mini progress bar ───────────────────────────────────────── */
function MiniBar({ score }: { score: number }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ width: 56, background: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="font-bold text-[10px] tabular-nums" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getAnalyses()
      .then(setAnalyses)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this analysis?')) return;
    setDeleting(id);
    try {
      await deleteAnalysis(id);
      setAnalyses((p) => p.filter((a) => a.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-20">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 mb-10 animate-fadeIn">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={12} style={{ color: 'var(--color-gold)' }} />
            <span
              className="text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Analysis History
            </span>
          </div>
          <h1
            className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none"
            style={{ color: 'var(--color-ink-900)' }}
          >
            Past Analyses
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-ink-500)' }}>
            {loading
              ? 'Loading…'
              : `${analyses.length} record${analyses.length !== 1 ? 's' : ''} stored`}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 h-10 text-sm font-semibold rounded-lg transition-all shrink-0"
          style={{
            background: 'linear-gradient(135deg, #c9972b, #f0c860)',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(201,151,43,0.35)',
          }}
        >
          <Plus size={14} /> New
        </Link>
      </div>

      {/* ── Loading skeletons ────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="shimmer rounded-xl h-24"
              style={{ border: '1px solid var(--color-border)' }}
            />
          ))}
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────── */}
      {!loading && analyses.length === 0 && (
        <div
          className="flex flex-col items-center gap-6 py-20 rounded-2xl animate-fadeUp"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center rounded-2xl"
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
            }}
          >
            <RotateCcw size={26} style={{ color: 'var(--color-ink-300)' }} />
          </div>
          <div className="text-center">
            <p
              className="font-bold text-base mb-2"
              style={{ color: 'var(--color-ink-900)' }}
            >
              No Analyses Yet
            </p>
            <p className="text-sm" style={{ color: 'var(--color-ink-500)' }}>
              Upload your first resume to get your ATS score
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 h-11 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9972b, #f0c860)',
              color: '#fff',
              boxShadow: '0 2px 10px rgba(201,151,43,0.35)',
            }}
          >
            Analyze Resume
          </Link>
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────── */}
      {!loading && analyses.length > 0 && (
        <div className="flex flex-col gap-3 animate-fadeUp">
          {analyses.map((a) => (
            <Link
              key={a.id}
              href={`/results/${a.id}`}
              style={{ textDecoration: 'none' }}
              className="group flex items-center gap-4 px-5 py-5 rounded-xl transition-all duration-150 card card-hover"
            >
              {/* Score */}
              <ScoreBadge score={a.atsScore} />

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="font-bold text-sm sm:text-base tracking-wide truncate"
                    style={{ color: 'var(--color-ink-900)' }}
                  >
                    {a.jobTitle && a.jobTitle !== 'Not Specified'
                      ? a.jobTitle
                      : 'Untitled Analysis'}
                  </span>
                  <MiniBar score={a.atsScore} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {a.companyName && a.companyName !== 'Not Specified' && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: 'var(--color-ink-500)' }}
                    >
                      <Building2 size={11} className="shrink-0" />
                      {a.companyName}
                    </span>
                  )}
                  {a.fileName && (
                    <span
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: 'var(--color-ink-500)' }}
                    >
                      <FileText size={11} className="shrink-0" />
                      {a.fileName}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: 'var(--color-ink-300)' }}
                  >
                    <Clock size={11} className="shrink-0" />
                    {new Date(a.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {a.pipelineVersion && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(37,99,235,0.08)',
                        border: '1px solid rgba(37,99,235,0.2)',
                        color: 'var(--color-neon-blue)',
                      }}
                    >
                      {a.pipelineVersion}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <ArrowRight
                  size={15}
                  style={{ color: 'var(--color-ink-300)' }}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
                <button
                  onClick={(e) => handleDelete(a.id, e)}
                  disabled={deleting === a.id}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(220,38,38,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'rgba(220,38,38,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'transparent';
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'transparent';
                  }}
                >
                  <Trash2 size={13} style={{ color: '#dc2626' }} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
