import { NextResponse } from "next/server";
import { badRequest, rateLimit, readJson, serverError, tooMany, withFallback } from "@/lib/api";
import { generateJson, geminiConfigured } from "@/lib/ai/gemini";
import { candidateMatchPrompt, SYSTEM_RECRUITMENT } from "@/lib/ai/prompts";
import { JobAnalysisSchema, MatchVerdictSchema, validator } from "@/lib/ai/schema";
import { demoMatchVerdict } from "@/lib/ai/demo";
import { getCandidate } from "@/lib/data/candidates";
import { scoreCandidate } from "@/lib/matching/engine";

export const runtime = "nodejs";

/** Reasoning layer for one candidate. Deterministic score is passed in as the anchor. */
export async function POST(req: Request) {
  if (!rateLimit(req, 40)) return tooMany();
  try {
    const body = await readJson<{ analysis?: unknown; candidateId?: string }>(req);
    const parsed = JobAnalysisSchema.safeParse(body?.analysis);
    if (!parsed.success) return badRequest("A valid job analysis is required.");
    const candidate = getCandidate(String(body?.candidateId ?? ""));
    if (!candidate) return badRequest("Unknown candidate.");

    const match = scoreCandidate(parsed.data, candidate);

    // Data minimisation: only job-relevant fields are sent to the model.
    const candidatePayload = JSON.stringify({
      role: candidate.role, sector: candidate.sector, years: candidate.years,
      skills: candidate.skills, certifications: candidate.certifications,
      languages: candidate.languages, availability: candidate.availability,
      gccExperience: candidate.gccExperience, summary: candidate.summary,
    });
    const deterministic = JSON.stringify({
      score: match.deterministicScore, breakdown: match.breakdown,
      hardGates: match.gates, eligible: match.eligible, gaps: match.gaps,
    });

    const result = await withFallback(
      () => generateJson(
        candidateMatchPrompt(JSON.stringify(parsed.data), candidatePayload, deterministic),
        validator(MatchVerdictSchema),
        { system: SYSTEM_RECRUITMENT, maxOutputTokens: 2048 },
      ),
      () => demoMatchVerdict(match),
      geminiConfigured(),
    );

    return NextResponse.json({ ...result, match });
  } catch (e) {
    return serverError(e);
  }
}
