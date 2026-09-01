import { embed, geminiConfigured } from "@/lib/ai/gemini";

/**
 * Embedding service with an honest fallback.
 *
 * - Gemini embeddings when GEMINI_API_KEY is set (true semantic space).
 * - Otherwise a deterministic hashed lexical embedding, so retrieval still
 *   works offline. It is NOT semantic: it matches tokens, not meaning. The UI
 *   labels this as "lexical fallback" rather than pretending otherwise.
 */

const DIMS = 512;
export type EmbeddingMode = "gemini" | "lexical";

const cache = new Map<string, number[]>();

export function embeddingMode(): EmbeddingMode {
  return geminiConfigured() ? "gemini" : "lexical";
}

export async function embedTexts(texts: string[]): Promise<{ vectors: number[][]; mode: EmbeddingMode }> {
  const misses = texts.filter((t) => !cache.has(key(t)));
  if (misses.length && geminiConfigured()) {
    try {
      const vecs = await embed(misses);
      misses.forEach((t, i) => cache.set(key(t), vecs[i]));
      return { vectors: texts.map((t) => cache.get(key(t)) ?? lexical(t)), mode: "gemini" };
    } catch {
      // fall through to lexical — never crash retrieval on an API failure
    }
  }
  if (!misses.length && geminiConfigured()) {
    return { vectors: texts.map((t) => cache.get(key(t))!), mode: "gemini" };
  }
  return { vectors: texts.map(lexical), mode: "lexical" };
}

export async function embedOne(text: string): Promise<{ vector: number[]; mode: EmbeddingMode }> {
  const { vectors, mode } = await embedTexts([text]);
  return { vector: vectors[0], mode };
}

const key = (t: string) => t.slice(0, 400);

/** Hashed bag-of-tokens with bigrams, L2-normalised. Deterministic. */
export function lexical(text: string): number[] {
  const v = new Array(DIMS).fill(0);
  const toks = tokenize(text);
  for (let i = 0; i < toks.length; i++) {
    add(v, toks[i], 1);
    if (i + 1 < toks.length) add(v, `${toks[i]}_${toks[i + 1]}`, 0.6);
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

function add(v: number[], token: string, w: number) {
  v[hash(token) % DIMS] += w;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#/\s-]/g, " ")
    .split(/[\s\-/]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

const STOP = new Set(["the","and","for","with","from","that","this","are","was","has","have","not","but","all","any","can","will","a","an","of","in","on","to","at","by","or","as","is","it","be"]);
