import { GoogleGenAI } from "@google/genai";

/**
 * Single server-side entry point to Gemini.
 * The API key is read from the environment and never reaches the browser
 * bundle — every call in this app originates from a route handler.
 */

const KEY = process.env.GEMINI_API_KEY?.trim();

export const MODELS = {
  /** Complex reasoning: briefs, strategy, candidate evaluation. */
  reasoning: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
  /** Cheap/fast: repetitive extraction and short summaries. */
  fast: process.env.GEMINI_FAST_MODEL?.trim() || "gemini-2.5-flash-lite",
  /** Retrieval embeddings. */
  embedding: process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-001",
};

export const geminiConfigured = () => Boolean(KEY);

let client: GoogleGenAI | null = null;
function ai(): GoogleGenAI {
  if (!KEY) throw new GeminiUnavailable("GEMINI_API_KEY is not configured");
  if (!client) client = new GoogleGenAI({ apiKey: KEY });
  return client;
}

export class GeminiUnavailable extends Error {}

export type Tier = "reasoning" | "fast";

interface GenOpts {
  tier?: Tier;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

/** Plain text generation. */
export async function generateText(prompt: string, o: GenOpts = {}): Promise<string> {
  const res = await withTimeout(
    ai().models.generateContent({
      model: MODELS[o.tier ?? "reasoning"],
      contents: prompt,
      config: {
        systemInstruction: o.system,
        temperature: o.temperature ?? 0.4,
        maxOutputTokens: o.maxOutputTokens ?? 2048,
      },
    }),
    o.timeoutMs ?? 45_000,
  );
  return res.text ?? "";
}

/**
 * Structured generation. Asks for JSON, then validates with the caller's
 * parser. One repair retry on malformed output — never an infinite loop.
 */
export async function generateJson<T>(
  prompt: string,
  validate: (raw: unknown) => T,
  o: GenOpts = {},
): Promise<T> {
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const p =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour previous response failed validation: ${lastErr}\nReturn ONLY valid JSON matching the specified shape. No markdown fences, no commentary.`;
    const res = await withTimeout(
      ai().models.generateContent({
        model: MODELS[o.tier ?? "reasoning"],
        contents: p,
        config: {
          systemInstruction: o.system,
          temperature: o.temperature ?? 0.3,
          maxOutputTokens: o.maxOutputTokens ?? 4096,
          responseMimeType: "application/json",
        },
      }),
      o.timeoutMs ?? 45_000,
    );
    try {
      return validate(parseJsonLoose(res.text ?? ""));
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`Model returned malformed JSON after retry: ${lastErr}`);
}

/** Embeds a batch of texts. Throws GeminiUnavailable when unconfigured. */
export async function embed(texts: string[]): Promise<number[][]> {
  const res = await withTimeout(
    ai().models.embedContent({ model: MODELS.embedding, contents: texts }),
    30_000,
  );
  const out = (res.embeddings ?? []).map((e) => e.values ?? []);
  if (out.length !== texts.length) throw new Error("embedding count mismatch");
  return out;
}

/** Tolerates fenced or prose-wrapped JSON without trusting the model to behave. */
export function parseJsonLoose(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(t);
  } catch {
    const s = t.indexOf("{");
    const a = t.indexOf("[");
    const start = s < 0 ? a : a < 0 ? s : Math.min(s, a);
    const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (start >= 0 && end > start) return JSON.parse(t.slice(start, end + 1));
    throw new Error("no JSON found in model output");
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Gemini timed out after ${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); },
           (e) => { clearTimeout(t); reject(e); });
  });
}
