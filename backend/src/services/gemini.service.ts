import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

export interface AIExplanation {
  jobTitle: string;
  companyName: string;
  overallFeedback: string;
  suggestions: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Gemini Service — EXPLANATION ONLY
 *
 * ⚠️  This service does NOT generate the ATS score.
 * The ATS score is computed deterministically by the scoring engines.
 *
 * Gemini is used ONLY to generate:
 *   - Human-readable explanation of the score
 *   - Actionable improvement suggestions
 *   - Job title / company name extraction
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateExplanation(
    resumeText: string,
    jobDescription: string,
    atsScore: number,
    missingSkills: string[],
  ): Promise<AIExplanation> {
    const prompt = `You are a career coach analyzing a resume against a job description.
The ATS score has already been computed deterministically as ${atsScore}/100.

## JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

## RESUME (excerpt):
${resumeText.slice(0, 2000)}

## MISSING SKILLS IDENTIFIED:
${missingSkills.slice(0, 10).join(', ')}

## TASK:
Return ONLY valid JSON (no markdown fences). DO NOT change the score — it is fixed.
Extract context and provide coaching:

{
  "jobTitle": "<extracted job title from JD>",
  "companyName": "<company name or Not Specified>",
  "overallFeedback": "<2-3 sentence human analysis of the ${atsScore} score>",
  "suggestions": [
    { "category": "<Skills|Format|Keywords|Experience>", "suggestion": "<specific action>", "priority": "high" }
  ]
}

Return max 5 suggestions. Priority: "high", "medium", or "low".`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    return this.parseResponse(text);
  }

  private parseResponse(text: string): AIExplanation {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        jobTitle: String(parsed.jobTitle || 'Not Specified'),
        companyName: String(parsed.companyName || 'Not Specified'),
        overallFeedback: String(parsed.overallFeedback || ''),
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [],
      };
    } catch (err) {
      logger.warn('Could not parse Gemini explanation response');
      return {
        jobTitle: 'Not Specified',
        companyName: 'Not Specified',
        overallFeedback: '',
        suggestions: [],
      };
    }
  }
}

export const geminiService = new GeminiService();
