import { NextResponse } from "next/server";
import { badRequest, rateLimit, readJson, sanitizeText, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { jobAnalysisPrompt, SYSTEM_RECRUITMENT } from "@/lib/ai/prompts";
import { JobAnalysisSchema, validator } from "@/lib/ai/schema";
import { demoJobAnalysis } from "@/lib/ai/demo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(req)) return tooMany();
  try {
    const body = await readJson<{ raw?: string }>(req);
    const raw = sanitizeText(body?.raw, 6000);
    if (raw.length < 20) return badRequest("Provide a job requirement of at least 20 characters.");

    const result = await withFallback(
      () => generateJson(jobAnalysisPrompt(raw), validator(JobAnalysisSchema), { tier: "fast", system: SYSTEM_RECRUITMENT }),
      () => demoJobAnalysis(raw),
      geminiConfigured(),
    );
    return NextResponse.json(result);
  } catch (e) {
    return serverError(e);
  }
}
