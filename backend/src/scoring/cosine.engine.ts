import { tokenize } from './normalizer';

export interface CosineResult {
  score: number; // [0, 1]
  dotProduct: number;
  magnitudeA: number;
  magnitudeB: number;
}

/**
 * TF-IDF Cosine Similarity Engine
 *
 * Computes cosine similarity between resume text and JD text
 * using TF-IDF weighted term vectors.
 *
 * No external model required — fully deterministic, pure math.
 * Same inputs → identical output every time.
 */
export function cosineEngine(params: {
  resumeText: string;
  jdText: string;
}): CosineResult {
  const { resumeText, jdText } = params;

  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jdText);

  if (resumeTokens.length === 0 || jdTokens.length === 0) {
    return { score: 0, dotProduct: 0, magnitudeA: 0, magnitudeB: 0 };
  }

  // Build TF maps
  const tfA = buildTF(resumeTokens);
  const tfB = buildTF(jdTokens);

  // Build vocabulary (union of both term sets)
  const vocab = new Set([...tfA.keys(), ...tfB.keys()]);

  // Compute IDF weights: idf(t) = ln(N / df(t)) + 1
  // N = 2 documents (resume + jd), df(t) ∈ {1, 2}
  const N = 2;
  const idf = new Map<string, number>();
  for (const term of vocab) {
    const df = (tfA.has(term) ? 1 : 0) + (tfB.has(term) ? 1 : 0);
    idf.set(term, Math.log(N / df) + 1);
  }

  // Build TF-IDF vectors
  const vecA = new Map<string, number>();
  const vecB = new Map<string, number>();

  for (const term of vocab) {
    const idfVal = idf.get(term) ?? 1;
    if (tfA.has(term)) vecA.set(term, tfA.get(term)! * idfVal);
    if (tfB.has(term)) vecB.set(term, tfB.get(term)! * idfVal);
  }

  // Cosine similarity
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const term of vocab) {
    const a = vecA.get(term) ?? 0;
    const b = vecB.get(term) ?? 0;
    dotProduct += a * b;
  }

  for (const val of vecA.values()) magA += val * val;
  for (const val of vecB.values()) magB += val * val;

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  const similarity = magA > 0 && magB > 0 ? dotProduct / (magA * magB) : 0;

  return {
    score: Math.min(1, Math.max(0, similarity)),
    dotProduct,
    magnitudeA: magA,
    magnitudeB: magB,
  };
}

function buildTF(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  // Normalize by document length
  const len = tokens.length;
  const tf = new Map<string, number>();
  for (const [term, count] of counts) {
    tf.set(term, count / len);
  }
  return tf;
}
