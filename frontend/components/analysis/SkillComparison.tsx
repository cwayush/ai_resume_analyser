'use client';

import { SkillsMatch } from '@/lib/api';

interface Props {
  skillsMatch: SkillsMatch;
}

export default function SkillComparison({ skillsMatch }: Props) {
  if (!skillsMatch) return null;

  const allSkills = [
    ...(skillsMatch.technical ?? []),
    ...(skillsMatch.soft ?? []),
    ...(skillsMatch.tools ?? []),
  ];

  const matched = allSkills.filter((s) => s.found).map((s) => s.skill);
  const missing = allSkills.filter((s) => !s.found).map((s) => s.skill);

  if (allSkills.length === 0) return null;

  const matchPct = Math.round((matched.length / allSkills.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            flex: 1,
            height: 6,
            background: '#161620',
            overflow: 'hidden',
            borderRadius: 0,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${matchPct}%`,
              background: 'linear-gradient(90deg, #22d45a, #4f8fff)',
              boxShadow: '0 0 8px rgba(34,212,90,0.4)',
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#a1a1aa', flexShrink: 0 }}>
          <span style={{ color: '#22d45a', fontWeight: 600 }}>
            {matched.length}
          </span>
          {' matched · '}
          <span style={{ color: '#ff4444', fontWeight: 600 }}>
            {missing.length}
          </span>
          {' missing'}
        </span>
      </div>

      {/* Matched */}
      {matched.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#22d45a',
              marginBottom: 10,
            }}
          >
            ✓ Matched Skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {matched.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(34,212,90,0.12)',
                  border: '1px solid rgba(34,212,90,0.4)',
                  color: '#22d45a',
                  boxShadow: '2px 2px 0 #000',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing */}
      {missing.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#ff4444',
              marginBottom: 10,
            }}
          >
            ✗ Missing Skills
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {missing.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(255,68,68,0.12)',
                  border: '1px solid rgba(255,68,68,0.4)',
                  color: '#ff4444',
                  boxShadow: '2px 2px 0 #000',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
