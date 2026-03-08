import { tokenize } from './normalizer';
import { BM25_CONFIG } from '../config';

export interface BM25Result {
  score: number; // [0, 1] normalized
  rawScore: number;
}

/**
 * BM25 Scoring Engine (Okapi BM25)
 *
 * Indexes resume text as a single-document corpus.
 * Queries using JD tokens.
 * Normalizes raw BM25 score to [0, 1] using a sigmoid-like normalization.
 *
 * Parameters: k1=1.5, b=0.75 (industry standard defaults)
 *
 * Deterministic: pure mathematical function, same inputs = same output.
 */
export function bm25Engine(params: {
  resumeText: string;
  jdText: string;
}): BM25Result {
  const { resumeText, jdText } = params;
  const { k1, b } = BM25_CONFIG;

  // Tokenize documents
  const resumeTokens = tokenize(resumeText);
  const queryTokens = tokenize(jdText);

  if (resumeTokens.length === 0 || queryTokens.length === 0) {
    return { score: 0, rawScore: 0 };
  }

  // Build term frequency map for resume
  const tf = new Map<string, number>();
  for (const token of resumeTokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }

  const docLength = resumeTokens.length;
  // avgdl = docLength since we have 1 document
  const avgdl = docLength;

  // BM25 score for single document
  let rawScore = 0;

  // Get unique query terms with their IDF
  // For single-document IDF, we use: idf = ln((1 - 0 + 0.5) / (0 + 0.5) + 1)
  // But for a multi-term JD vs single resume, we approximate:
  //   idf(t) = ln(((N - df + 0.5) / (df + 0.5)) + 1)
  // With N=1 corpus doc, df ∈ {0, 1}
  const uniqueQueryTerms = [...new Set(queryTokens)];

  for (const term of uniqueQueryTerms) {
    const dfTerm = tf.has(term) ? 1 : 0; // df is 0 or 1 (single doc)
    const N = 1;

    // IDF with smoothing
    const idf = Math.log((N - dfTerm + 0.5) / (dfTerm + 0.5) + 1);

    // Term frequency in resume
    const termFreq = tf.get(term) ?? 0;

    // BM25 term score
    const numerator = termFreq * (k1 + 1);
    const denominator = termFreq + k1 * (1 - b + b * (docLength / avgdl));
    const termScore = idf * (numerator / denominator);

    rawScore += termScore;
  }

  // Normalize: use sigmoid-like normalization
  // Raw scores for typical document pairs range from 0 to ~20
  // We normalize to [0, 1] using: score = rawScore / (rawScore + 10)
  const normalizedScore =
    rawScore > 0 ? rawScore / (rawScore + uniqueQueryTerms.length) : 0;

  return {
    score: Math.min(1, Math.max(0, normalizedScore)),
    rawScore,
  };
}
