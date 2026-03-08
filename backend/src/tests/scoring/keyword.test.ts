import {
  keywordEngine,
  extractSkillsFromText,
} from '../../scoring/keyword.engine';

describe('Keyword Engine', () => {
  const resumeText =
    'Senior software engineer with 5 years experience in React, Node.js, TypeScript, PostgreSQL, Docker, and AWS. Led agile teams and mentored junior developers.';

  it('returns perfect score when all required skills match', () => {
    const result = keywordEngine({
      resumeText,
      requiredSkills: ['react', 'node.js', 'typescript'],
      optionalSkills: [],
    });
    expect(result.score).toBeCloseTo(1.0, 1);
    expect(result.matchedSkills).toEqual(
      expect.arrayContaining(['react', 'node.js', 'typescript']),
    );
    expect(result.missingSkills.length).toBe(0);
  });

  it('returns 0 when no skills match', () => {
    const result = keywordEngine({
      resumeText: 'No relevant skills here.',
      requiredSkills: ['react', 'node.js', 'typescript'],
      optionalSkills: ['aws', 'docker'],
    });
    expect(result.score).toBe(0);
    expect(result.missingSkills).toEqual(
      expect.arrayContaining(['react', 'node.js', 'typescript']),
    );
  });

  it('applies 0.7/0.3 weighting correctly', () => {
    // required: 2/2 matched (1.0), optional: 0/2 matched (0.0)
    const result = keywordEngine({
      resumeText: 'React and Node.js developer.',
      requiredSkills: ['react', 'node.js'],
      optionalSkills: ['python', 'java'],
    });
    // score = 0.7 * 1.0 + 0.3 * 0.0 = 0.7
    expect(result.score).toBeCloseTo(0.7, 2);
  });

  it('is deterministic — same input yields same output every time', () => {
    const run1 = keywordEngine({
      resumeText,
      requiredSkills: ['react', 'typescript'],
      optionalSkills: ['docker'],
    });
    const run2 = keywordEngine({
      resumeText,
      requiredSkills: ['react', 'typescript'],
      optionalSkills: ['docker'],
    });
    const run3 = keywordEngine({
      resumeText,
      requiredSkills: ['react', 'typescript'],
      optionalSkills: ['docker'],
    });
    expect(run1.score).toBe(run2.score);
    expect(run2.score).toBe(run3.score);
    expect(run1.matchedSkills).toEqual(run2.matchedSkills);
  });

  it('treats optional-only match correctly', () => {
    const result = keywordEngine({
      resumeText: 'Python developer with Django experience.',
      requiredSkills: [],
      optionalSkills: ['python', 'django'],
    });
    // All required matched (0/0 → 1.0), all optional matched
    expect(result.score).toBeGreaterThan(0.9);
  });

  it('extracts skills from JD text', () => {
    const jd = `
      Required: 3+ years of React and Node.js experience.
      Must have: TypeScript, PostgreSQL
      Preferred: Docker, AWS
    `;
    const { required, optional } = extractSkillsFromText(jd);
    expect(required.length).toBeGreaterThan(0);
  });
});
