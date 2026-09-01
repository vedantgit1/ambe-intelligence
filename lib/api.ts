import { NextResponse } from "next/server";

/** Small shared surface for every route handler: limits, validation, errors. */

const hits = new Map<string, { n: number; reset: number }>();

/** Fixed-window in-process rate limit. Adequate for a single-instance demo. */
export function rateLimit(req: Request, limit = 30, windowMs = 60_000): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.reset) { hits.set(ip, { n: 1, reset: now + windowMs }); return true; }
  cur.n += 1;
  return cur.n <= limit;
}

export const tooMany = () =>
  NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Never leak internals to the client; never log candidate data. */
export function serverError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Unexpected error";
  console.error("[ambe] route error:", msg);
  return NextResponse.json({ error: "The request could not be completed.", detail: msg.slice(0, 200) }, { status: 500 });
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try { return (await req.json()) as T; } catch { return null; }
}

/** Strips control characters and caps length before any text reaches a model. */
export function sanitizeText(input: unknown, max = 20_000): string {
  if (typeof input !== "string") return "";
  let out = "";
  for (const ch of input.slice(0, max)) {
    const code = ch.codePointAt(0)!;
    out += code < 32 ? (ch === "\n" || ch === "\t" ? ch : " ") : code === 127 ? " " : ch;
  }
  return out.trim();
}


/**
 * Runs the model path, falling back to computed demo intelligence on any
 * failure. The caller always learns which one produced the answer.
 */
export async function withFallback<T>(
  live: () => Promise<T>,
  fallback: () => T,
  enabled: boolean,
): Promise<{ data: T; source: "gemini" | "demo"; note?: string }> {
  if (!enabled) return { data: fallback(), source: "demo", note: "GEMINI_API_KEY not configured" };
  try {
    return { data: await live(), source: "gemini" };
  } catch (e) {
    return { data: fallback(), source: "demo", note: e instanceof Error ? e.message.slice(0, 160) : "model call failed" };
  }
}
