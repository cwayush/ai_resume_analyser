'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function JDTextarea({ value, onChange }: Props) {
  const count = value.length;
  const min = 50;
  const valid = count >= min;
  const charColor = valid
    ? '#16a34a'
    : count > 0
      ? '#ca8a04'
      : 'var(--color-ink-300)';

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label
          className="text-[10px] font-bold tracking-[0.15em] uppercase"
          style={{ color: 'var(--color-ink-300)' }}
        >
          Content
        </label>
        <span
          className="text-[10px] font-semibold"
          style={{ color: charColor }}
        >
          {count.toLocaleString()}{' '}
          {!valid && count > 0 ? `/ ${min} min` : 'chars'}
        </span>
      </div>
      <textarea
        className="w-full text-sm leading-relaxed p-4 resize-y outline-none transition-all rounded-xl font-[inherit]"
        style={{
          background: 'var(--color-surface-2)',
          border: `1px solid ${valid ? 'rgba(22,163,74,0.4)' : 'var(--color-border)'}`,
          color: 'var(--color-ink-700)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
        }}
        onFocus={(e) => {
          (e.target as HTMLTextAreaElement).style.borderColor =
            'var(--color-gold)';
          (e.target as HTMLTextAreaElement).style.boxShadow =
            '0 0 0 3px rgba(201,151,43,0.12)';
        }}
        onBlur={(e) => {
          (e.target as HTMLTextAreaElement).style.borderColor = valid
            ? 'rgba(22,163,74,0.4)'
            : 'var(--color-border)';
          (e.target as HTMLTextAreaElement).style.boxShadow =
            'inset 0 1px 3px rgba(0,0,0,0.05)';
        }}
        rows={13}
        placeholder={`Paste the full job description here...\n\nExample:\nWe are looking for a Senior Software Engineer...\n• Requirements: 5+ years TypeScript...\n• Skills: React, Node.js, PostgreSQL...`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {count > 0 && !valid && (
        <p className="text-[10px] font-semibold" style={{ color: '#ca8a04' }}>
          ⚠ Minimum {min} characters required
        </p>
      )}
    </div>
  );
}
