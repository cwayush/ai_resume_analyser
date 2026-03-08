import skillDictionary from '../data/skill-dictionary.json';

// Build reverse lookup: alias → canonical
const aliasMap = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(
  skillDictionary as Record<string, string[]>,
)) {
  for (const alias of aliases) {
    aliasMap.set(alias.toLowerCase().trim(), canonical.toLowerCase().trim());
  }
  aliasMap.set(canonical.toLowerCase().trim(), canonical.toLowerCase().trim());
}

/**
 * Normalize a single skill string using the dictionary.
 */
export function normalizeSkill(skill: string): string {
  const cleaned = skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.+#\s/]/g, '');
  return aliasMap.get(cleaned) ?? cleaned;
}

/**
 * Normalize a list of skills — deduplicate after normalization.
 */
export function normalizeSkills(skills: string[]): string[] {
  const normalized = skills.map(normalizeSkill);
  return [...new Set(normalized)].filter((s) => s.length > 0);
}

/**
 * Normalize raw text: lowercase, collapse whitespace.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Extract candidate experience years from text using regex heuristics.
 * Returns 0 if not found.
 */
export function extractExperienceYears(text: string): number {
  const lower = text.toLowerCase();

  // Patterns: "5 years", "5+ years", "5-7 years", "five years", "Experience: 5 years"
  const patterns = [
    /(\d+)\s*\+?\s*years?\s+of\s+(?:professional\s+)?experience/i,
    /(\d+)\s*\+?\s*years?\s+experience/i,
    /experience\s*[:\s]+(\d+)\s*\+?\s*years?/i,
    /experience\s+of\s+(\d+)\s*\+?\s*years?/i,
    /(\d+)\s*[-–]\s*\d+\s+years?\s+(?:of\s+)?experience/i,
    /(\d+)\s*\+\s*years?/i,
    /over\s+(\d+)\s+years?/i,
    /more\s+than\s+(\d+)\s+years?/i,
    /(\d+)\s+years?\s+(?:in|at|with|of)/i,
    // Fallback: any "N years" that has experience-related context nearby
    /(?:experience|work|career|professional)\b[^.]{0,80}?(\d+)\s+years?/i,
    /(\d+)\s+years?\b[^.]{0,80}?(?:experience|work|career|professional)/i,
  ];

  // Word-to-number map for written years
  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val > 0 && val <= 50) return val;
    }
  }

  // Written numbers
  for (const [word, num] of Object.entries(wordMap)) {
    if (new RegExp(`${word}\\s+years?`).test(lower)) {
      return num;
    }
  }

  return 0;
}

/**
 * Tokenize text into unique lowercase words (removes stop words, punctuation).
 */
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'can',
  'not',
  'no',
  'nor',
  'so',
  'yet',
  'both',
  'either',
  'neither',
  'as',
  'if',
  'then',
  'than',
  'that',
  'this',
  'these',
  'those',
  'we',
  'you',
  'he',
  'she',
  'it',
  'they',
  'their',
  'our',
  'your',
  'its',
  'my',
  'his',
  'her',
  'such',
  'more',
  'also',
  'any',
  'all',
  'each',
  'which',
  'who',
  'what',
  'when',
  'where',
  'how',
  'why',
  'up',
  'out',
  'about',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.#+]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}
