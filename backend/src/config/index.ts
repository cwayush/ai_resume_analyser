import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001'),
  DATABASE_URL: z
    .string()
    .optional()
    .default('postgresql://localhost/resume_ats'),
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // In test mode throw; in production exit process
  if (process.env.NODE_ENV === 'test') {
    throw new Error(
      `Invalid env vars: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const config = parsed.data;

// ─── Pipeline Version ────────────────────────────────────────────────────────
export const PIPELINE_VERSION = 'v2.0.0';

// ─── Scoring Weights ─────────────────────────────────────────────────────────
// Weights must sum to 1.0
// These can be moved to DB for recruiter-adjustable weights in the future.
export const SCORING_WEIGHTS = {
  keyword: 0.35,
  bm25: 0.25,
  cosine: 0.25,
  experience: 0.1,
  hardFilter: 0.05,
} as const;

// Validate weights sum to 1.0
const weightSum = Object.values(SCORING_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
  throw new Error(`Scoring weights must sum to 1.0, got ${weightSum}`);
}

// ─── BM25 Params ─────────────────────────────────────────────────────────────
export const BM25_CONFIG = {
  k1: 1.5, // Term frequency saturation parameter
  b: 0.75, // Length normalization parameter
} as const;

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
export const CACHE_TTL = {
  parsedResume: 86400, // 24 hours
  embedding: 604800, // 7 days
  analysisResult: 86400, // 24 hours
} as const;
