import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({ baseURL: API_URL, timeout: 90000 });

export interface SkillItem {
  skill: string;
  found: boolean;
}
export interface SkillsMatch {
  technical: SkillItem[];
  soft: SkillItem[];
  tools: SkillItem[];
}
export interface Suggestion {
  category: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}
export interface ExperienceMatch {
  required: string;
  candidate: string;
  match: boolean;
  notes: string;
}
export interface ScoreBreakdown {
  keyword: number;
  bm25: number;
  cosine: number;
  experience: number;
  hardFilter: number;
}
export interface Analysis {
  id: string;
  jobTitle: string | null;
  companyName: string | null;
  atsScore: number;
  resumeText: string;
  jobDescription: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillsMatch: SkillsMatch;
  suggestions: Suggestion[];
  experienceMatch: ExperienceMatch;
  educationMatch: ExperienceMatch;
  overallFeedback: string | null;
  fileName: string | null;
  createdAt: string;
  scoreBreakdown: ScoreBreakdown | null;
  pipelineVersion: string | null;
}
export interface AnalysisSummary {
  id: string;
  jobTitle: string | null;
  companyName: string | null;
  atsScore: number;
  fileName: string | null;
  createdAt: string;
  pipelineVersion: string | null;
  scoreBreakdown: ScoreBreakdown | null;
}

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string,
): Promise<Analysis> {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);
  const response = await api.post<{ success: boolean; data: Analysis }>(
    '/api/analyze',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data.data;
}

export async function getAnalyses(): Promise<AnalysisSummary[]> {
  const response = await api.get<{ success: boolean; data: AnalysisSummary[] }>(
    '/api/analyses',
  );
  return response.data.data;
}

export async function getAnalysis(id: string): Promise<Analysis> {
  const response = await api.get<{ success: boolean; data: Analysis }>(
    `/api/analyses/${id}`,
  );
  return response.data.data;
}

export async function deleteAnalysis(id: string): Promise<void> {
  await api.delete(`/api/analyses/${id}`);
}
