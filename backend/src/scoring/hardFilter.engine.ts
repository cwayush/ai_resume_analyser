import { normalizeSkills, extractExperienceYears } from './normalizer';

export interface HardFilterResult {
  score: number; // 0 | 0.5 | 1.0
  passed: boolean; // true if score >= 0.5
  mandatorySkillsMet: boolean;
  experienceMet: boolean;
  reasons: string[];
}

/**
 * Hard Filter Engine
 *
 * Checks mandatory (must-have) requirements:
 *   - Required skills subset present in resume
 *   - Minimum experience years met
 *
 * Score: 0.5 per dimension → max 1.0
 *
 * Deterministic: same inputs always produce same output.
 */
export function hardFilterEngine(params: {
  resumeText: string;
  jdText: string;
  requiredSkills: string[];
  requiredYears: number;
}): HardFilterResult {
  const { resumeText, jdText: _, requiredSkills, requiredYears } = params;
  const reasons: string[] = [];

  // ─── Skill Check ─────────────────────────────────────────────────────────
  const resumeNorm = resumeText.toLowerCase();
  const normalizedRequired = normalizeSkills(requiredSkills);

  let mandatorySkillsMet = true;
  const missingMandatory: string[] = [];

  if (normalizedRequired.length > 0) {
    for (const skill of normalizedRequired) {
      if (!resumeNorm.includes(skill)) {
        missingMandatory.push(skill);
        mandatorySkillsMet = false;
      }
    }
    if (!mandatorySkillsMet) {
      reasons.push(`Missing mandatory skills: ${missingMandatory.join(', ')}`);
    }
  }
  // No required skills = automatic pass on that dimension
  if (normalizedRequired.length === 0) mandatorySkillsMet = true;

  // ─── Experience Check ─────────────────────────────────────────────────────
  const candidateYears = extractExperienceYears(resumeText);
  let experienceMet = true;

  if (requiredYears > 0) {
    experienceMet = candidateYears >= requiredYears;
    if (!experienceMet) {
      reasons.push(
        `Experience: required ${requiredYears}y, candidate has ~${candidateYears}y`,
      );
    }
  }

  // ─── Aggregate ────────────────────────────────────────────────────────────
  const score = (mandatorySkillsMet ? 0.5 : 0) + (experienceMet ? 0.5 : 0);

  return {
    score,
    passed: score >= 0.5,
    mandatorySkillsMet,
    experienceMet,
    reasons,
  };
}
