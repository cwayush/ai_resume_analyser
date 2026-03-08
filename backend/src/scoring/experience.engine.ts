import { extractExperienceYears } from './normalizer';

export interface ExperienceResult {
  score: number; // [0, 1]
  candidateYears: number;
  requiredYears: number;
  exceeds: boolean;
}

/**
 * Experience Scoring Engine
 *
 * Formula:
 *   if candidate_years >= required_years → score = 1.0
 *   else → score = candidate_years / required_years
 *
 * Deterministic: pure arithmetic on regex-extracted numbers.
 */
export function experienceEngine(params: {
  resumeText: string;
  jdText: string;
}): ExperienceResult {
  const { resumeText, jdText } = params;

  const candidateYears = extractExperienceYears(resumeText);
  const requiredYears = extractExperienceYears(jdText);

  // No requirement stated → candidate passes automatically
  if (requiredYears === 0) {
    return {
      score: 1.0,
      candidateYears,
      requiredYears: 0,
      exceeds: true,
    };
  }

  const score =
    candidateYears >= requiredYears ? 1.0 : candidateYears / requiredYears;

  return {
    score: Math.min(1, Math.max(0, score)),
    candidateYears,
    requiredYears,
    exceeds: candidateYears >= requiredYears,
  };
}
