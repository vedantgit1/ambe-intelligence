import { NextResponse } from "next/server";
import { rateLimit, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { executiveBriefPrompt, SYSTEM_EXECUTIVE } from "@/lib/ai/prompts";
import { BriefSchema, validator } from "@/lib/ai/schema";
import { demoBrief } from "@/lib/ai/demo";
import { businessContext } from "@/lib/analytics/metrics";

export const runtime = "nodejs";

/** Short-lived cache: repeated demo clicks must not repeatedly bill the model. */
let cache: { at: number; payload: unknown } | null = null;
const TTL = 5 * 60_000;

export async function POST(req: Request) {
  if (!rateLimit(req, 12)) return tooMany();
  try {
    const fresh = new URL(req.url).searchParams.get("refresh") === "1";
    if (!fresh && cache && Date.now() - cache.at < TTL) {
      return NextResponse.json({ ...(cache.payload as object), cached: true });
    }
    const result = await withFallback(
      () => generateJson(executiveBriefPrompt(businessContext()), validator(BriefSchema), { system: SYSTEM_EXECUTIVE, maxOutputTokens: 4096 }),
      demoBrief,
      geminiConfigured(),
    );
    cache = { at: Date.now(), payload: result };
    return NextResponse.json(result);
  } catch (e) {
    return serverError(e);
  }
}
