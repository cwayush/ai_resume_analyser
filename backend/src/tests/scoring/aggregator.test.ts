import { aggregateScore } from '../../scoring/aggregator';
import { SCORING_WEIGHTS, PIPELINE_VERSION } from '../../config';

describe('Score Aggregator', () => {
  it('weights sum to exactly 1.0', () => {
    const sum = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });

  it('returns 100 when all engines score 1.0', () => {
    const result = aggregateScore({
      keyword: 1.0,
      bm25: 1.0,
      cosine: 1.0,
      experience: 1.0,
      hardFilter: 1.0,
    });
    expect(result.atsScore).toBe(100);
  });

  it('returns 0 when all engines score 0', () => {
    const result = aggregateScore({
      keyword: 0,
      bm25: 0,
      cosine: 0,
      experience: 0,
      hardFilter: 0,
    });
    expect(result.atsScore).toBe(0);
  });

  it('applies correct weights in formula', () => {
    const result = aggregateScore({
      keyword: 1.0, // 0.35 × 1.0 = 0.35
      bm25: 0.0, // 0.25 × 0.0 = 0.00
      cosine: 0.0, // 0.25 × 0.0 = 0.00
      experience: 0.0, // 0.10 × 0.0 = 0.00
      hardFilter: 0.0, // 0.05 × 0.0 = 0.00
      // total = 0.35 → atsScore = 35
    });
    expect(result.atsScore).toBeCloseTo(35, 1);
  });

  it('returns score with 1 decimal precision', () => {
    const result = aggregateScore({
      keyword: 0.5,
      bm25: 0.6,
      cosine: 0.7,
      experience: 0.8,
      hardFilter: 0.9,
    });
    const str = result.atsScore.toString();
    const decimalPart = str.split('.')[1];
    expect(decimalPart === undefined || decimalPart.length <= 1).toBe(true);
  });

  it('clamps out-of-range inputs to [0, 1]', () => {
    const result = aggregateScore({
      keyword: 1.5, // over
      bm25: -0.2, // under
      cosine: 0.5,
      experience: 2.0, // over
      hardFilter: 0.5,
    });
    // Clamped: keyword=1, bm25=0, experience=1
    // 0.35×1 + 0.25×0 + 0.25×0.5 + 0.10×1 + 0.05×0.5 = 0.35 + 0.125 + 0.10 + 0.025 = 0.6
    expect(result.atsScore).toBeCloseTo(60, 1);
  });

  it('includes pipelineVersion in result', () => {
    const result = aggregateScore({
      keyword: 0.8,
      bm25: 0.7,
      cosine: 0.75,
      experience: 0.9,
      hardFilter: 1.0,
    });
    expect(result.pipelineVersion).toBe(PIPELINE_VERSION);
  });

  it('score is always in [0, 100] range', () => {
    const testCases = [
      {
        keyword: 0.3,
        bm25: 0.4,
        cosine: 0.5,
        experience: 0.6,
        hardFilter: 0.7,
      },
      {
        keyword: 1.0,
        bm25: 1.0,
        cosine: 1.0,
        experience: 1.0,
        hardFilter: 1.0,
      },
      { keyword: 0, bm25: 0, cosine: 0, experience: 0, hardFilter: 0 },
    ];
    for (const input of testCases) {
      const result = aggregateScore(input);
      expect(result.atsScore).toBeGreaterThanOrEqual(0);
      expect(result.atsScore).toBeLessThanOrEqual(100);
    }
  });

  it('is deterministic — same input always yields same score', () => {
    const input = {
      keyword: 0.78,
      bm25: 0.69,
      cosine: 0.83,
      experience: 0.9,
      hardFilter: 1.0,
    };
    const r1 = aggregateScore(input);
    const r2 = aggregateScore(input);
    const r3 = aggregateScore(input);
    expect(r1.atsScore).toBe(r2.atsScore);
    expect(r2.atsScore).toBe(r3.atsScore);
  });
});
