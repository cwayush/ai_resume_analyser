/**
 * Determinism Regression Tests
 *
 * These tests verify that the same resume + same JD inputs always produce
 * the exact same score components. Run these after any scoring engine change
 * to catch regressions.
 */

import { keywordEngine } from '../../scoring/keyword.engine';
import { bm25Engine } from '../../scoring/bm25.engine';
import { cosineEngine } from '../../scoring/cosine.engine';
import { experienceEngine } from '../../scoring/experience.engine';
import { hardFilterEngine } from '../../scoring/hardFilter.engine';
import { aggregateScore } from '../../scoring/aggregator';

const SAMPLE_RESUME = `
John Smith | john@email.com | +1-555-0001

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2019 - Present (5 years)
- Led development of React and Node.js microservices
- TypeScript migration of legacy codebase
- Deployed applications on AWS using Docker and Kubernetes
- PostgreSQL database optimization

SKILLS
Technical: React, Node.js, TypeScript, Python, Docker, Kubernetes, AWS, PostgreSQL, Redis
Tools: Git, Jest, CI/CD, GitHub Actions

EDUCATION
B.S. Computer Science, State University, 2018
`;

const SAMPLE_JD = `
Senior Software Engineer — FinTech Startup

We are looking for a Senior Software Engineer with 4+ years of experience.

Required Skills:
- React, Node.js, TypeScript
- PostgreSQL or MongoDB
- Docker and Kubernetes
- AWS experience

Preferred Skills:
- Python
- Redis
- CI/CD pipelines

Responsibilities:
- Build scalable microservices
- Lead technical initiatives
- Mentor junior engineers
`;

const REQUIRED_SKILLS = [
  'react',
  'node.js',
  'typescript',
  'postgresql',
  'docker',
  'kubernetes',
  'aws',
];
const OPTIONAL_SKILLS = ['python', 'redis', 'ci/cd'];

describe('Determinism Regression Suite', () => {
  const RUNS = 5;

  it('keyword engine: identical score across all runs', () => {
    const scores = Array.from({ length: RUNS }, () =>
      keywordEngine({
        resumeText: SAMPLE_RESUME,
        requiredSkills: REQUIRED_SKILLS,
        optionalSkills: OPTIONAL_SKILLS,
      }),
    );
    const first = scores[0].score;
    expect(scores.every((r) => r.score === first)).toBe(true);
  });

  it('bm25 engine: identical score across all runs', () => {
    const scores = Array.from({ length: RUNS }, () =>
      bm25Engine({ resumeText: SAMPLE_RESUME, jdText: SAMPLE_JD }),
    );
    const first = scores[0].score;
    expect(scores.every((r) => r.score === first)).toBe(true);
  });

  it('cosine engine: identical score across all runs', () => {
    const scores = Array.from({ length: RUNS }, () =>
      cosineEngine({ resumeText: SAMPLE_RESUME, jdText: SAMPLE_JD }),
    );
    const first = scores[0].score;
    expect(scores.every((r) => r.score === first)).toBe(true);
  });

  it('experience engine: identical score across all runs', () => {
    const scores = Array.from({ length: RUNS }, () =>
      experienceEngine({ resumeText: SAMPLE_RESUME, jdText: SAMPLE_JD }),
    );
    const first = scores[0].score;
    expect(scores.every((r) => r.score === first)).toBe(true);
  });

  it('hard filter engine: identical score across all runs', () => {
    const scores = Array.from({ length: RUNS }, () =>
      hardFilterEngine({
        resumeText: SAMPLE_RESUME,
        jdText: SAMPLE_JD,
        requiredSkills: REQUIRED_SKILLS,
        requiredYears: 4,
      }),
    );
    const first = scores[0].score;
    expect(scores.every((r) => r.score === first)).toBe(true);
  });

  it('final aggregated ATS score: identical across all runs — snapshot test', () => {
    const computeScore = () => {
      const kw = keywordEngine({
        resumeText: SAMPLE_RESUME,
        requiredSkills: REQUIRED_SKILLS,
        optionalSkills: OPTIONAL_SKILLS,
      });
      const bm25 = bm25Engine({ resumeText: SAMPLE_RESUME, jdText: SAMPLE_JD });
      const cosine = cosineEngine({
        resumeText: SAMPLE_RESUME,
        jdText: SAMPLE_JD,
      });
      const exp = experienceEngine({
        resumeText: SAMPLE_RESUME,
        jdText: SAMPLE_JD,
      });
      const hf = hardFilterEngine({
        resumeText: SAMPLE_RESUME,
        jdText: SAMPLE_JD,
        requiredSkills: REQUIRED_SKILLS,
        requiredYears: 4,
      });

      return aggregateScore({
        keyword: kw.score,
        bm25: bm25.score,
        cosine: cosine.score,
        experience: exp.score,
        hardFilter: hf.score,
      });
    };

    const results = Array.from({ length: RUNS }, computeScore);
    const firstScore = results[0].atsScore;

    // All runs must produce the same score
    expect(results.every((r) => r.atsScore === firstScore)).toBe(true);

    // Score must be in valid range
    expect(firstScore).toBeGreaterThan(0);
    expect(firstScore).toBeLessThanOrEqual(100);

    // Snapshot: score for this matching resume+JD combo should be > 40
    expect(firstScore).toBeGreaterThan(40);

    console.log(`\n✅ Deterministic ATS Score: ${firstScore}/100\n`);
  });
});
