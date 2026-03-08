import { normalizeSkill, normalizeSkills } from './normalizer';

export interface KeywordResult {
  score: number; // [0, 1]
  matchedSkills: string[];
  missingSkills: string[];
  requiredMatchRate: number;
  optionalMatchRate: number;
}

/**
 * Keyword Matching Engine
 *
 * Formula:
 *   keyword_score = 0.7 × (matched_required / total_required)
 *                 + 0.3 × (matched_optional / total_optional)
 *
 * Deterministic: uses set intersection — same resume + same JD = same result.
 */
export function keywordEngine(params: {
  resumeText: string;
  requiredSkills: string[];
  optionalSkills: string[];
}): KeywordResult {
  const { resumeText, requiredSkills, optionalSkills } = params;

  const resumeLower = resumeText.toLowerCase();

  // Normalize all skills
  const normRequired = normalizeSkills(requiredSkills);
  const normOptional = normalizeSkills(optionalSkills);

  // Helper: check if skill exists in resume text
  const skillFound = (skill: string): boolean => {
    const norm = normalizeSkill(skill);
    return resumeLower.includes(norm);
  };

  // ─── Required Skills ─────────────────────────────────────────────────────
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  for (const skill of normRequired) {
    if (skillFound(skill)) {
      matchedRequired.push(skill);
    } else {
      missingRequired.push(skill);
    }
  }

  const requiredMatchRate =
    normRequired.length > 0
      ? matchedRequired.length / normRequired.length
      : 1.0;

  // ─── Optional Skills ─────────────────────────────────────────────────────
  const matchedOptional: string[] = [];
  const missingOptional: string[] = [];

  for (const skill of normOptional) {
    if (skillFound(skill)) {
      matchedOptional.push(skill);
    } else {
      missingOptional.push(skill);
    }
  }

  const optionalMatchRate =
    normOptional.length > 0
      ? matchedOptional.length / normOptional.length
      : 1.0;

  // ─── Weighted Score ───────────────────────────────────────────────────────
  const score = 0.7 * requiredMatchRate + 0.3 * optionalMatchRate;

  return {
    score: Math.min(1, Math.max(0, score)),
    matchedSkills: [...matchedRequired, ...matchedOptional],
    missingSkills: [...missingRequired, ...missingOptional],
    requiredMatchRate,
    optionalMatchRate,
  };
}

/**
 * Extract skills from free-form text using pattern matching.
 * Used when JD doesn't explicitly list required/optional skills.
 */
export function extractSkillsFromText(text: string): {
  required: string[];
  optional: string[];
} {
  const lower = text.toLowerCase();

  // Detect "required" section keywords
  const requiredSectionPattern =
    /(?:required|must.have|mandatory|essential|qualifications?|minimum requirements?)[:\s]([^]*?)(?=preferred|nice.to.have|optional|responsibilities|$)/i;

  const optionalSectionPattern =
    /(?:preferred|nice.to.have|bonus|plus|optional)[:\s]([^]*?)(?=required|must.have|responsibilities|$)/i;

  // All candidate skills from the dictionary
  const allSkills = [
    'react',
    'node.js',
    'typescript',
    'javascript',
    'python',
    'java',
    'golang',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'postgresql',
    'mongodb',
    'redis',
    'graphql',
    'rest',
    'microservices',
    'ci/cd',
    'git',
    'linux',
    'machine learning',
    'deep learning',
    'tensorflow',
    'pytorch',
    'next.js',
    'angular',
    'vue',
    'django',
    'flask',
    'spring',
    'express',
    'fastapi',
    'kafka',
    'elasticsearch',
    'sql',
    'tailwind',
    'agile',
    'leadership',
    'communication',
    'problem solving',
  ];

  const requiredSection = lower.match(requiredSectionPattern)?.[1] ?? lower;
  const optionalSection = lower.match(optionalSectionPattern)?.[1] ?? '';

  const required: string[] = [];
  const optional: string[] = [];

  for (const skill of allSkills) {
    if (requiredSection.includes(skill)) required.push(skill);
    else if (optionalSection.includes(skill)) optional.push(skill);
    else if (lower.includes(skill)) required.push(skill);
  }

  return {
    required: [...new Set(required)],
    optional: [...new Set(optional)],
  };
}
