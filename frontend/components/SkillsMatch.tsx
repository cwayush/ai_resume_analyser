'use client';
import { SkillsMatch as SkillsMatchType, SkillItem } from '@/lib/api';

interface Props {
  skillsMatch: SkillsMatchType;
}

function SkillRow({ item }: { item: SkillItem }) {
  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--color-ink-700)' }}
      >
        {item.skill}
      </span>
      {item.found ? (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md"
          style={{
            background: 'rgba(22,163,74,0.1)',
            border: '1px solid rgba(22,163,74,0.25)',
            color: '#16a34a',
          }}
        >
          ✓ FOUND
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md"
          style={{
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.22)',
            color: '#dc2626',
          }}
        >
          ✗ MISSING
        </span>
      )}
    </div>
  );
}

function SkillSection({ title, items }: { title: string; items: SkillItem[] }) {
  if (!items || items.length === 0) return null;
  const found = items.filter((i) => i.found).length;
  const ratio = `${found}/${items.length}`;
  const color =
    found === items.length ? '#16a34a' : found === 0 ? '#dc2626' : '#ca8a04';
  return (
    <div className="mb-5 last:mb-0">
      <div
        className="flex items-center justify-between mb-2 pb-2"
        style={{ borderBottom: '1px solid var(--color-border-2)' }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.12em] uppercase"
          style={{ color: 'var(--color-ink-300)' }}
        >
          {title}
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {ratio}
        </span>
      </div>
      <div className="last:border-b-0">
        {items.map((item) => (
          <SkillRow key={item.skill} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function SkillsMatch({ skillsMatch }: Props) {
  if (!skillsMatch) return null;
  return (
    <div>
      <SkillSection title="Technical Skills" items={skillsMatch.technical} />
      <SkillSection title="Soft Skills" items={skillsMatch.soft} />
      <SkillSection title="Tools & Platforms" items={skillsMatch.tools} />
    </div>
  );
}
