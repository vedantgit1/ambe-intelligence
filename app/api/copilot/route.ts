import { NextResponse } from "next/server";
import { badRequest, rateLimit, readJson, sanitizeText, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { copilotPrompt, SYSTEM_EXECUTIVE } from "@/lib/ai/prompts";
import { CopilotSchema, validator } from "@/lib/ai/schema";
import { demoCopilot } from "@/lib/ai/demo";
import { businessContext } from "@/lib/analytics/metrics";
import { formatChunks, retrieveKnowledge } from "@/lib/rag";

export const runtime = "nodejs";

/** Grounded copilot: retrieval first, then reasoning over the retrieved context. */
export async function POST(req: Request) {
  if (!rateLimit(req, 30)) return tooMany();
  try {
    const body = await readJson<{ question?: string }>(req);
    const question = sanitizeText(body?.question, 1000);
    if (question.length < 3) return badRequest("Ask a question.");

    const sources = await retrieveKnowledge(question, 4);
    const result = await withFallback(
      () => generateJson(copilotPrompt(question, businessContext(), formatChunks(sources)), validator(CopilotSchema), { system: SYSTEM_EXECUTIVE, maxOutputTokens: 2048 }),
      () => demoCopilot(question),
      geminiConfigured(),
    );
    return NextResponse.json({ ...result, sources });
  } catch (e) {
    return serverError(e);
  }
}
