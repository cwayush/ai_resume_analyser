import { SCORING_WEIGHTS, PIPELINE_VERSION } from '../config';

export interface ScoreBreakdown {
  keyword: number;
  bm25: number;
  cosine: number;
  experience: number;
  hardFilter: number;
}

export interface AggregatorResult {
  atsScore: number; // Final score 0–100, 1 decimal place
  scoreBreakdown: ScoreBreakdown;
  pipelineVersion: string;
  weights: typeof SCORING_WEIGHTS;
}

/**
 * Final Score Aggregator
 *
 * Formula:
 *   final_score = 100 × (
 *     0.35 × keyword_score +
 *     0.25 × bm25_score +
 *     0.25 × cosine_score +
 *     0.10 × experience_score +
 *     0.05 × hard_filter_score
 *   )
 *
 * All input scores must be in [0, 1].
 * Output is rounded to 1 decimal place.
 *
 * Deterministic: pure arithmetic.
 */
export function aggregateScore(breakdown: ScoreBreakdown): AggregatorResult {
  const w = SCORING_WEIGHTS;

  // Clamp each component to [0, 1]
  const keyword = clamp(breakdown.keyword);
  const bm25 = clamp(breakdown.bm25);
  const cosine = clamp(breakdown.cosine);
  const experience = clamp(breakdown.experience);
  const hardFilter = clamp(breakdown.hardFilter);

  const rawScore =
    w.keyword * keyword +
    w.bm25 * bm25 +
    w.cosine * cosine +
    w.experience * experience +
    w.hardFilter * hardFilter;

  // Scale to 0–100 and round to 1 decimal
  const atsScore = Math.round(rawScore * 100 * 10) / 10;

  return {
    atsScore,
    scoreBreakdown: { keyword, bm25, cosine, experience, hardFilter },
    pipelineVersion: PIPELINE_VERSION,
    weights: w,
  };
}

function clamp(val: number): number {
  return Math.min(1, Math.max(0, val));
}
