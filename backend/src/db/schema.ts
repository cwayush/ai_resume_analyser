import {
  pgTable,
  uuid,
  text,
  real,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobTitle: text('job_title'),
  companyName: text('company_name'),
  // ATS score as real (float) to support 1 decimal precision e.g. 82.4
  atsScore: real('ats_score').notNull(),
  resumeText: text('resume_text').notNull(),
  jobDescription: text('job_description').notNull(),
  // SHA256 hashes for cache + deduplication
  resumeHash: text('resume_hash').notNull().default(''),
  jdHash: text('jd_hash').notNull().default(''),
  matchedKeywords: jsonb('matched_keywords').$type<string[]>().default([]),
  missingKeywords: jsonb('missing_keywords').$type<string[]>().default([]),
  skillsMatch: jsonb('skills_match')
    .$type<{
      technical: Array<{ skill: string; found: boolean }>;
      soft: Array<{ skill: string; found: boolean }>;
      tools: Array<{ skill: string; found: boolean }>;
    }>()
    .default({ technical: [], soft: [], tools: [] }),
  suggestions: jsonb('suggestions')
    .$type<
      Array<{
        category: string;
        suggestion: string;
        priority: 'high' | 'medium' | 'low';
      }>
    >()
    .default([]),
  experienceMatch: jsonb('experience_match')
    .$type<{
      required: string;
      candidate: string;
      match: boolean;
      notes: string;
    }>()
    .default({ required: '', candidate: '', match: false, notes: '' }),
  educationMatch: jsonb('education_match')
    .$type<{
      required: string;
      candidate: string;
      match: boolean;
      notes: string;
    }>()
    .default({ required: '', candidate: '', match: false, notes: '' }),
  overallFeedback: text('overall_feedback'),
  fileName: text('file_name'),
  // Score breakdown for explainability
  scoreBreakdown: jsonb('score_breakdown')
    .$type<{
      keyword: number;
      bm25: number;
      cosine: number;
      experience: number;
      hardFilter: number;
    }>()
    .default({ keyword: 0, bm25: 0, cosine: 0, experience: 0, hardFilter: 0 }),
  // Pipeline version for reproducibility
  pipelineVersion: text('pipeline_version').default('v2.0.0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
