import { NextResponse } from "next/server";
import { rateLimit, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { riskAnalysisPrompt, SYSTEM_EXECUTIVE } from "@/lib/ai/prompts";
import { DiagnosisSchema, validator } from "@/lib/ai/schema";
import { demoDiagnosis } from "@/lib/ai/demo";
import { businessContext } from "@/lib/analytics/metrics";
import { formatChunks, retrieveKnowledge } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(req, 20)) return tooMany();
  try {
    const sources = await retrieveKnowledge("documentation bottleneck deployment stage dwell time conversion", 3);
    const ctx = `${businessContext()}\n\nINTERNAL WORKFLOW KNOWLEDGE:\n${formatChunks(sources)}`;
    const result = await withFallback(
      () => generateJson(riskAnalysisPrompt(ctx), validator(DiagnosisSchema), { system: SYSTEM_EXECUTIVE, maxOutputTokens: 3072 }),
      demoDiagnosis,
      geminiConfigured(),
    );
    return NextResponse.json({ ...result, sources });
  } catch (e) {
    return serverError(e);
  }
}
