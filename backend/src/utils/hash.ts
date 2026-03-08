import { createHash } from 'crypto';

/**
 * Generate a SHA256 hash of a string.
 * Same input always produces the same output — deterministic by definition.
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Generate a cache key from resume hash + jd hash.
 */
export function buildCacheKey(resumeHash: string, jdHash: string): string {
  return `ats:result:${resumeHash}:${jdHash}`;
}

export function buildResumeParseKey(resumeHash: string): string {
  return `ats:parse:${resumeHash}`;
}
