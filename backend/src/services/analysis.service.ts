import { sha256, buildCacheKey } from '../utils/hash';
import { cacheGet, cacheSet } from '../lib/redis';
import { CACHE_TTL, PIPELINE_VERSION } from '../config';
import { logger } from '../utils/logger';
import {
  keywordEngine,
  extractSkillsFromText,
} from '../scoring/keyword.engine';
import { bm25Engine } from '../scoring/bm25.engine';
import { cosineEngine } from '../scoring/cosine.engine';
import { experienceEngine } from '../scoring/experience.engine';
import { hardFilterEngine } from '../scoring/hardFilter.engine';
import { aggregateScore } from '../scoring/aggregator';
import { analysisRepository } from '../repositories/analysis.repository';
import { geminiService } from './gemini.service';

export interface AnalysisRequest {
  resumeText: string;
  resumeHash: string;
  jobDescription: string;
  fileName?: string;
  enableAIExplanation?: boolean;
}

export class AnalysisService {
  async analyze(req: AnalysisRequest) {
    const {
      resumeText,
      resumeHash,
      jobDescription,
      fileName,
      enableAIExplanation = true,
    } = req;
    const jdHash = sha256(jobDescription.toLowerCase().trim());

    // ─── Cache Check ──────────────────────────────────────────────────────────
    const cacheKey = buildCacheKey(resumeHash, jdHash);
    const cached = await cacheGet(cacheKey);

    if (cached) {
      logger.info('ATS cache hit — returning cached result', {
        resumeHash,
        jdHash,
      });
      return JSON.parse(cached);
    }

    logger.info('Running deterministic ATS pipeline', {
      resumeHash,
      jdHash,
      pipelineVersion: PIPELINE_VERSION,
    });

    // ─── Step 1: Extract skills from JD ───────────────────────────────────────
    const { required: requiredSkills, optional: optionalSkills } =
      extractSkillsFromText(jobDescription);

    logger.debug('Skills extracted from JD', {
      required: requiredSkills.length,
      optional: optionalSkills.length,
    });

    // ─── Step 2: Run all 5 scoring engines ───────────────────────────────────

    // Engine 1: Hard Filter
    const hardFilterResult = hardFilterEngine({
      resumeText,
      jdText: jobDescription,
      requiredSkills,
      requiredYears: 0, // extracted from JD by experience engine
    });

    // Engine 2: Keyword Matching
    const keywordResult = keywordEngine({
      resumeText,
      requiredSkills,
      optionalSkills,
    });

    // Engine 3: BM25
    const bm25Result = bm25Engine({
      resumeText,
      jdText: jobDescription,
    });

    // Engine 4: Cosine Similarity (TF-IDF)
    const cosineResult = cosineEngine({
      resumeText,
      jdText: jobDescription,
    });

    // Engine 5: Experience
    const experienceResult = experienceEngine({
      resumeText,
      jdText: jobDescription,
    });

    logger.debug('Engine scores', {
      hardFilter: hardFilterResult.score,
      keyword: keywordResult.score,
      bm25: bm25Result.score,
      cosine: cosineResult.score,
      experience: experienceResult.score,
    });

    // ─── Step 3: Aggregate ────────────────────────────────────────────────────
    const aggregated = aggregateScore({
      keyword: keywordResult.score,
      bm25: bm25Result.score,
      cosine: cosineResult.score,
      experience: experienceResult.score,
      hardFilter: hardFilterResult.score,
    });

    // ─── Step 4: Build skills match structure ─────────────────────────────────
    const buildSkillItems = (skills: string[], foundSet: string[]) =>
      skills.map((skill) => ({
        skill,
        found: foundSet.includes(skill),
      }));

    const skillsMatch = {
      technical: buildSkillItems(
        [...requiredSkills, ...optionalSkills].filter((s) =>
          [
            'react',
            'node.js',
            'typescript',
            'python',
            'java',
            'golang',
            'docker',
            'kubernetes',
            'aws',
            'sql',
            'postgresql',
            'mongodb',
          ].includes(s),
        ),
        keywordResult.matchedSkills,
      ),
      soft: buildSkillItems(
        [...requiredSkills, ...optionalSkills].filter((s) =>
          [
            'communication',
            'leadership',
            'problem solving',
            'collaboration',
            'agile',
          ].includes(s),
        ),
        keywordResult.matchedSkills,
      ),
      tools: buildSkillItems(
        [...requiredSkills, ...optionalSkills].filter((s) =>
          ['git', 'jira', 'webpack', 'vite', 'jest', 'ci/cd'].includes(s),
        ),
        keywordResult.matchedSkills,
      ),
    };

    // ─── Step 5: Optional AI explanation ─────────────────────────────────────
    let jobTitle = 'Not Specified';
    let companyName = 'Not Specified';
    let overallFeedback = '';
    let suggestions: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    if (enableAIExplanation && process.env.GEMINI_API_KEY) {
      try {
        const aiResult = await geminiService.generateExplanation(
          resumeText,
          jobDescription,
          aggregated.atsScore,
          keywordResult.missingSkills,
        );
        jobTitle = aiResult.jobTitle;
        companyName = aiResult.companyName;
        overallFeedback = aiResult.overallFeedback;
        suggestions = aiResult.suggestions;
        logger.debug('AI explanation generated', { jobTitle, companyName });
      } catch (err) {
        logger.warn('AI explanation failed — using defaults', {
          error: (err as Error).message,
        });
      }
    }

    // Generate fallback suggestions from hard filter
    if (suggestions.length === 0) {
      suggestions = this.buildFallbackSuggestions(
        keywordResult.missingSkills,
        hardFilterResult.reasons,
        experienceResult,
      );
    }

    const experienceMatch = {
      required:
        experienceResult.requiredYears > 0
          ? `${experienceResult.requiredYears} years`
          : 'Not specified',
      candidate:
        experienceResult.candidateYears > 0
          ? `${experienceResult.candidateYears} years`
          : 'Not detected',
      match: experienceResult.exceeds,
      notes: experienceResult.exceeds
        ? 'Experience requirement met'
        : `${experienceResult.candidateYears} years found vs ${experienceResult.requiredYears} years required`,
    };

    // ─── Step 6: Save to DB ───────────────────────────────────────────────────
    const saved = await analysisRepository.create({
      jobTitle,
      companyName,
      atsScore: aggregated.atsScore,
      resumeText,
      jobDescription,
      resumeHash,
      jdHash,
      matchedKeywords: keywordResult.matchedSkills,
      missingKeywords: keywordResult.missingSkills,
      skillsMatch,
      suggestions,
      experienceMatch,
      educationMatch: {
        required: '',
        candidate: '',
        match: false,
        notes: 'Not evaluated',
      },
      overallFeedback,
      fileName,
      scoreBreakdown: aggregated.scoreBreakdown,
      pipelineVersion: PIPELINE_VERSION,
    });

    logger.info('Analysis complete', {
      id: saved.id,
      atsScore: aggregated.atsScore,
      pipelineVersion: PIPELINE_VERSION,
    });

    // ─── Step 7: Cache result ─────────────────────────────────────────────────
    await cacheSet(cacheKey, JSON.stringify(saved), CACHE_TTL.analysisResult);

    return saved;
  }

  private buildFallbackSuggestions(
    missingSkills: string[],
    hardFilterReasons: string[],
    experience: {
      candidateYears: number;
      requiredYears: number;
      exceeds: boolean;
    },
  ): Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const suggestions: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    if (missingSkills.length > 0) {
      suggestions.push({
        category: 'Skills',
        suggestion: `Add these missing skills to your resume: ${missingSkills.slice(0, 5).join(', ')}`,
        priority: 'high',
      });
    }

    if (!experience.exceeds && experience.requiredYears > 0) {
      suggestions.push({
        category: 'Experience',
        suggestion: `The job requires ${experience.requiredYears} years of experience. Highlight projects to demonstrate seniority.`,
        priority: 'high',
      });
    }

    for (const reason of hardFilterReasons) {
      suggestions.push({
        category: 'Requirements',
        suggestion: reason,
        priority: 'high',
      });
    }

    suggestions.push({
      category: 'Keyword Optimization',
      suggestion:
        'Tailor your resume language to mirror the exact phrasing in the job description.',
      priority: 'medium',
    });

    return suggestions.slice(0, 6);
  }
}

export const analysisService = new AnalysisService();
