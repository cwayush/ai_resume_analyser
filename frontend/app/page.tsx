'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Loader2,
  Cpu,
  ChevronRight,
  Shield,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import ResumeUploader from '@/components/ResumeUploader';
import JDTextarea from '@/components/JDTextarea';
import { analyzeResume } from '@/lib/api';

function EngineChip({
  dot,
  label,
  weight,
}: {
  dot: string;
  label: string;
  weight: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: dot, boxShadow: `0 0 5px ${dot}` }}
      />
      <span
        className="text-[12px] font-medium"
        style={{ color: 'var(--color-ink-500)' }}
      >
        {label}
      </span>
      <span className="text-[12px] font-bold" style={{ color: dot }}>
        {weight}
      </span>
    </div>
  );
}

function FeatureCard({
  num,
  desc,
  icon: Icon,
  color,
}: {
  num: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="p-6 sm:p-7 flex flex-col gap-4 rounded-xl transition-all duration-200 card card-hover">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--color-ink-300)' }}
        >
          {num}
        </span>
        <div
          className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-ink-500)' }}
      >
        {desc}
      </p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const canSubmit = !!file && jd.trim().length >= 50 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const tid = toast.loading('Running 5-engine ATS pipeline…', {
      duration: 90000,
    });
    try {
      const r = await analyzeResume(file!, jd);
      toast.dismiss(tid);
      toast.success(`Score: ${r.atsScore}/100`);
      router.push(`/results/${r.id}`);
    } catch (err: unknown) {
      toast.dismiss(tid);
      const msg =
        (err as { response?: { data?: { error?: string } }; message?: string })
          ?.response?.data?.error ||
        (err as { message?: string })?.message ||
        'Analysis failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="text-center mb-12 sm:mb-16 animate-fadeUp">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full"
          style={{
            background: 'var(--color-gold-bg)',
            border: '1px solid rgba(201,151,43,0.35)',
          }}
        >
          <Cpu size={11} style={{ color: 'var(--color-gold)' }} />
          <span
            className="text-[11px] font-bold tracking-[0.12em] uppercase"
            style={{ color: 'var(--color-gold-deep)' }}
          >
            Deterministic ATS Engine &nbsp;·&nbsp; v2.0.0
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-extrabold leading-tight tracking-tight mb-3"
          style={{
            fontSize: 'clamp(2.4rem,7vw,4.8rem)',
            color: 'var(--color-ink-900)',
          }}
        >
          Beat the
        </h1>
        <h1
          className="font-extrabold leading-tight tracking-tight mb-8"
          style={{
            fontSize: 'clamp(2.4rem,7vw,4.8rem)',
            background: 'linear-gradient(135deg, #c9972b, #f0c860)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ATS Filter.
        </h1>

        {/* Sub */}
        <p
          className="text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
          style={{ color: 'var(--color-ink-500)' }}
        >
          Upload your resume and paste the job description. Get a fully
          explainable,{' '}
          <strong
            className="font-semibold"
            style={{ color: 'var(--color-ink-900)' }}
          >
            deterministic ATS score
          </strong>{' '}
          from 5 independent engines.
        </p>

        {/* Engine chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <EngineChip
            dot="var(--color-neon-blue)"
            label="Keyword Match"
            weight="35%"
          />
          <EngineChip
            dot="var(--color-neon-purple)"
            label="BM25"
            weight="25%"
          />
          <EngineChip
            dot="var(--color-neon-green)"
            label="Cosine"
            weight="25%"
          />
          <EngineChip
            dot="var(--color-neon-yellow)"
            label="Experience"
            weight="10%"
          />
          <EngineChip
            dot="var(--color-neon-red)"
            label="Hard Filter"
            weight="5%"
          />
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        {/* Two-panel input */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 mb-6 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          }}
        >
          {/* Resume */}
          <div
            className="p-6 sm:p-8"
            style={{
              borderBottom: 'var(--color-border)',
              borderRight: `1px solid var(--color-border)`,
            }}
          >
            <div className="mb-5">
              <p
                className="text-sm font-bold tracking-[0.06em] uppercase mb-1"
                style={{ color: 'var(--color-ink-900)' }}
              >
                Upload Resume
              </p>
              <p className="text-xs" style={{ color: 'var(--color-ink-300)' }}>
                PDF, DOC, or DOCX · Max 5 MB
              </p>
            </div>
            <ResumeUploader file={file} onFileChange={setFile} />
          </div>

          {/* JD */}
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <p
                className="text-sm font-bold tracking-[0.06em] uppercase mb-1"
                style={{ color: 'var(--color-ink-900)' }}
              >
                Job Description
              </p>
              <p className="text-xs" style={{ color: 'var(--color-ink-300)' }}>
                Paste the full JD for best results
              </p>
            </div>
            <JDTextarea value={jd} onChange={setJd} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-3 px-10 sm:px-16 h-12 sm:h-14 text-sm sm:text-base font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canSubmit
                ? 'linear-gradient(135deg, #c9972b, #f0c860)'
                : 'var(--color-border)',
              color: '#fff',
              boxShadow: canSubmit ? '0 4px 20px rgba(201,151,43,0.4)' : 'none',
              transform: 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              if (canSubmit)
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                'translateY(0)';
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Cpu size={16} /> Run ATS Analysis <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            num="01. Deterministic"
            desc="Same resume + JD always yields the exact same score. Zero AI randomness."
            icon={Shield}
            color="var(--color-neon-green)"
          />
          <FeatureCard
            num="02. Explainable"
            desc="Full per-engine breakdown — see exactly how each engine contributed."
            icon={BarChart2}
            color="var(--color-neon-blue)"
          />
          <FeatureCard
            num="03. AI-Enhanced"
            desc="Gemini writes your coaching feedback. It never touches the numeric score."
            icon={Sparkles}
            color="var(--color-neon-purple)"
          />
        </div>
      </form>
    </div>
  );
}
