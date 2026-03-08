import { experienceEngine } from '../../scoring/experience.engine';
import { extractExperienceYears } from '../../scoring/normalizer';

describe('Experience Engine', () => {
  it('returns score 1.0 when candidate meets requirement', () => {
    const result = experienceEngine({
      resumeText: '7 years of experience in software development.',
      jdText: 'Requires 5 years of experience.',
    });
    expect(result.score).toBe(1.0);
    expect(result.exceeds).toBe(true);
    expect(result.candidateYears).toBe(7);
    expect(result.requiredYears).toBe(5);
  });

  it('returns proportional score when candidate falls short', () => {
    const result = experienceEngine({
      resumeText: '2 years experience in React.',
      jdText: 'Requires 4 years experience.',
    });
    expect(result.score).toBeCloseTo(0.5, 2);
    expect(result.exceeds).toBe(false);
  });

  it('returns 1.0 when no requirement is stated', () => {
    const result = experienceEngine({
      resumeText: '2 years experience.',
      jdText: 'Build great software products.',
    });
    expect(result.score).toBe(1.0);
    expect(result.requiredYears).toBe(0);
  });

  it('is deterministic', () => {
    const params = {
      resumeText: 'Software engineer with 3 years of professional experience.',
      jdText: 'Minimum 5 years experience required.',
    };
    const r1 = experienceEngine(params);
    const r2 = experienceEngine(params);
    const r3 = experienceEngine(params);
    expect(r1.score).toBe(r2.score);
    expect(r2.score).toBe(r3.score);
  });

  it('score is always in [0, 1]', () => {
    const tests = [
      { resumeText: '1 year experience', jdText: '10 years required' },
      { resumeText: '10 years experience', jdText: '1 year required' },
      { resumeText: 'no experience stated', jdText: '5 years required' },
    ];
    for (const t of tests) {
      const result = experienceEngine(t);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    }
  });

  describe('extractExperienceYears', () => {
    const cases: [string, number][] = [
      ['5 years of experience', 5],
      ['over 3 years experience', 3],
      ['10+ years of professional experience in software', 10],
      ['more than 8 years of industry experience', 8],
      ['Experience: 7 years as a developer', 7],
      ['2 years of experience minimum', 2],
      ['No experience mentioned', 0],
    ];

    cases.forEach(([text, expected]) => {
      it(`extracts ${expected} from: "${text}"`, () => {
        expect(extractExperienceYears(text)).toBe(expected);
      });
    });
  });
});
