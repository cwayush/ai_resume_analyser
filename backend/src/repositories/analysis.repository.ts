import { db } from '../db';
import { analyses } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface AnalysisInsertData {
  jobTitle?: string;
  companyName?: string;
  atsScore: number;
  resumeText: string;
  jobDescription: string;
  resumeHash: string;
  jdHash: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillsMatch: {
    technical: Array<{ skill: string; found: boolean }>;
    soft: Array<{ skill: string; found: boolean }>;
    tools: Array<{ skill: string; found: boolean }>;
  };
  suggestions: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  experienceMatch: {
    required: string;
    candidate: string;
    match: boolean;
    notes: string;
  };
  educationMatch: {
    required: string;
    candidate: string;
    match: boolean;
    notes: string;
  };
  overallFeedback?: string;
  fileName?: string;
  scoreBreakdown: {
    keyword: number;
    bm25: number;
    cosine: number;
    experience: number;
    hardFilter: number;
  };
  pipelineVersion: string;
}

export const analysisRepository = {
  async create(data: AnalysisInsertData) {
    const [result] = await db
      .insert(analyses)
      .values({
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        atsScore: data.atsScore,
        resumeText: data.resumeText,
        jobDescription: data.jobDescription,
        resumeHash: data.resumeHash,
        jdHash: data.jdHash,
        matchedKeywords: data.matchedKeywords,
        missingKeywords: data.missingKeywords,
        skillsMatch: data.skillsMatch,
        suggestions: data.suggestions,
        experienceMatch: data.experienceMatch,
        educationMatch: data.educationMatch,
        overallFeedback: data.overallFeedback,
        fileName: data.fileName,
        scoreBreakdown: data.scoreBreakdown,
        pipelineVersion: data.pipelineVersion,
      })
      .returning();

    logger.debug('Analysis saved to DB', {
      id: result.id,
      atsScore: data.atsScore,
    });
    return result;
  },

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.id, id))
      .limit(1);
    return result ?? null;
  },

  async findAll(limit = 50) {
    return db
      .select({
        id: analyses.id,
        jobTitle: analyses.jobTitle,
        companyName: analyses.companyName,
        atsScore: analyses.atsScore,
        fileName: analyses.fileName,
        createdAt: analyses.createdAt,
        pipelineVersion: analyses.pipelineVersion,
        scoreBreakdown: analyses.scoreBreakdown,
      })
      .from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(limit);
  },

  async deleteById(id: string) {
    const [deleted] = await db
      .delete(analyses)
      .where(eq(analyses.id, id))
      .returning({ id: analyses.id });
    return deleted ?? null;
  },
};
