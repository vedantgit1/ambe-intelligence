import { NextResponse } from "next/server";
import { badRequest, rateLimit, readJson, sanitizeText, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { strategyPrompt, SYSTEM_EXECUTIVE } from "@/lib/ai/prompts";
import { StrategyPlanSchema, validator } from "@/lib/ai/schema";
import { demoStrategy } from "@/lib/ai/demo";
import { businessContext } from "@/lib/analytics/metrics";
import { PRIORITIES } from "@/lib/data/business";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(req, 20)) return tooMany();
  try {
    const body = await readJson<{ priorityId?: string }>(req);
    const p = PRIORITIES.find((x) => x.id === sanitizeText(body?.priorityId, 20));
    if (!p) return badRequest("Unknown strategic priority.");

    const priority = JSON.stringify({
      title: p.title, objective: p.objective, owner: p.owner, status: p.status,
      progress: p.progress, milestones: p.milestones, dependencies: p.dependencies,
      kpis: p.kpis, risks: p.risks, nextDecision: p.nextDecision,
    });

    const result = await withFallback(
      () => generateJson(strategyPrompt(priority, businessContext()), validator(StrategyPlanSchema), { system: SYSTEM_EXECUTIVE, maxOutputTokens: 4096 }),
      () => demoStrategy(p.title),
      geminiConfigured(),
    );
    return NextResponse.json(result);
  } catch (e) {
    return serverError(e);
  }
}
