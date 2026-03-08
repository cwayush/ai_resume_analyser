import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, PIPELINE_VERSION } from './config';
import { logger } from './utils/logger';
import analysisRoutes from './routes/analysis.routes';
import { db } from './db';
import { sql } from 'drizzle-orm';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    pipelineVersion: PIPELINE_VERSION,
    scoring: 'deterministic',
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', analysisRoutes);

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(
  (
    err: Error & { status?: number; code?: string },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    logger.error('Unhandled error', { message: err.message, stack: err.stack });

    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
      return;
    }

    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  },
);

// ─── DB Migration: Ensure new columns exist ────────────────────────────────────
async function migrateDatabase() {
  logger.info('🔗 Connecting to database...');
  try {
    // Create table with all columns if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_title TEXT,
        company_name TEXT,
        ats_score REAL NOT NULL,
        resume_text TEXT NOT NULL,
        job_description TEXT NOT NULL,
        resume_hash TEXT NOT NULL DEFAULT '',
        jd_hash TEXT NOT NULL DEFAULT '',
        matched_keywords JSONB DEFAULT '[]',
        missing_keywords JSONB DEFAULT '[]',
        skills_match JSONB DEFAULT '{"technical":[],"soft":[],"tools":[]}',
        suggestions JSONB DEFAULT '[]',
        experience_match JSONB DEFAULT '{"required":"","candidate":"","match":false,"notes":""}',
        education_match JSONB DEFAULT '{"required":"","candidate":"","match":false,"notes":""}',
        overall_feedback TEXT,
        file_name TEXT,
        score_breakdown JSONB DEFAULT '{"keyword":0,"bm25":0,"cosine":0,"experience":0,"hardFilter":0}',
        pipeline_version TEXT DEFAULT 'v2.0.0',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Add new columns if migrating from old schema (idempotent)
    const migrations = [
      `ALTER TABLE analyses ADD COLUMN IF NOT EXISTS resume_hash TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE analyses ADD COLUMN IF NOT EXISTS jd_hash TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE analyses ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{"keyword":0,"bm25":0,"cosine":0,"experience":0,"hardFilter":0}'`,
      `ALTER TABLE analyses ADD COLUMN IF NOT EXISTS pipeline_version TEXT DEFAULT 'v2.0.0'`,
      // Alter ats_score from integer to real if upgrading
      `DO $$ BEGIN
         IF EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name='analyses' AND column_name='ats_score'
                    AND data_type='integer') THEN
           ALTER TABLE analyses ALTER COLUMN ats_score TYPE REAL;
         END IF;
       END $$`,
    ];

    for (const migration of migrations) {
      await db.execute(sql.raw(migration));
    }

    logger.info('✅ Database schema ready (v2.0.0)');
  } catch (error) {
    logger.error('❌ Database initialization failed', { error });
    process.exit(1);
  }
}

async function start() {
  await migrateDatabase();
  app.listen(config.PORT, () => {
    logger.info(`🚀 Resume Analyzer API — http://localhost:${config.PORT}`);
    logger.info(`📋 Pipeline: ${PIPELINE_VERSION} | Scoring: deterministic`);
    logger.info(`🔍 Health: http://localhost:${config.PORT}/health`);
  });
}

start();
