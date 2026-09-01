import { NextResponse } from "next/server";
import { rateLimit, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { skillGapPrompt, SYSTEM_EXECUTIVE } from "@/lib/ai/prompts";
import { SkillGapSchema, validator } from "@/lib/ai/schema";
import { demoSkillGap } from "@/lib/ai/demo";
import { skillContext } from "@/lib/analytics/metrics";

export const runtime = "nodejs";

let cache: { at: number; payload: unknown } | null = null;

export async function POST(req: Request) {
  if (!rateLimit(req, 15)) return tooMany();
  try {
    if (cache && Date.now() - cache.at < 5 * 60_000) {
      return NextResponse.json({ ...(cache.payload as object), cached: true });
    }
    const result = await withFallback(
      () => generateJson(skillGapPrompt(skillContext()), validator(SkillGapSchema), { system: SYSTEM_EXECUTIVE, maxOutputTokens: 3072 }),
      demoSkillGap,
      geminiConfigured(),
    );
    cache = { at: Date.now(), payload: result };
    return NextResponse.json(result);
  } catch (e) {
    return serverError(e);
  }
}
