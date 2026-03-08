'use client';

interface Props {
  matched: string[];
  missing: string[];
}

export default function KeywordBadges({ matched, missing }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {matched.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-1 h-4 rounded-full"
              style={{ background: '#16a34a' }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: '#16a34a' }}
            >
              Matched
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(22,163,74,0.1)',
                border: '1px solid rgba(22,163,74,0.25)',
                color: '#16a34a',
              }}
            >
              {matched.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-default transition-transform hover:-translate-y-px"
                style={{
                  background: 'rgba(22,163,74,0.08)',
                  border: '1px solid rgba(22,163,74,0.25)',
                  color: '#16a34a',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-1 h-4 rounded-full"
              style={{ background: '#dc2626' }}
            />
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: '#dc2626' }}
            >
              Missing
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.25)',
                color: '#dc2626',
              }}
            >
              {missing.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-md cursor-default transition-transform hover:-translate-y-px"
                style={{
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.25)',
                  color: '#dc2626',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
