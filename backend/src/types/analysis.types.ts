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

export interface EducationMatch {
  required: string;
  candidate: string;
  match: boolean;
  notes: string;
}

export interface AnalysisResult {
  atsScore: number;
  jobTitle: string;
  companyName: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillsMatch: SkillsMatch;
  suggestions: Suggestion[];
  experienceMatch: ExperienceMatch;
  educationMatch: EducationMatch;
  overallFeedback: string;
}
