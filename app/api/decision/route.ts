import { NextResponse } from "next/server";
import { badRequest, rateLimit, readJson, sanitizeText, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { decisionPrompt, SYSTEM_EXECUTIVE } from "@/lib/ai/prompts";
import { DecisionSupportSchema, validator } from "@/lib/ai/schema";
import { demoDecision } from "@/lib/ai/demo";
import { businessContext } from "@/lib/analytics/metrics";
import { DECISIONS } from "@/lib/data/business";
import { formatChunks, retrieveKnowledge } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(req, 25)) return tooMany();
  try {
    const body = await readJson<{ decisionId?: string }>(req);
    const d = DECISIONS.find((x) => x.id === sanitizeText(body?.decisionId, 20));
    if (!d) return badRequest("Unknown decision.");

    const sources = await retrieveKnowledge(`${d.decision}. ${d.context}`, 3);
    const text = `${d.decision}\nContext: ${d.context}\nOwner: ${d.owner}\nImpact: ${d.impact}\nStatus: ${d.status}\n\nRelevant internal policy:\n${formatChunks(sources)}`;

    const result = await withFallback(
      () => generateJson(decisionPrompt(text, businessContext()), validator(DecisionSupportSchema), { system: SYSTEM_EXECUTIVE, maxOutputTokens: 3072 }),
      () => demoDecision(d.decision),
      geminiConfigured(),
    );
    return NextResponse.json({ ...result, sources });
  } catch (e) {
    return serverError(e);
  }
}
