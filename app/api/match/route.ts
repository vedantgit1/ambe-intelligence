import { NextResponse } from "next/server";
import { badRequest, rateLimit, readJson, serverError, tooMany } from "@/lib/api";
import { JobAnalysisSchema, type JobAnalysis } from "@/lib/ai/schema";
import { retrieveCandidates } from "@/lib/rag";
import { embeddingMode } from "@/lib/rag/embeddings";
import { rank } from "@/lib/matching/engine";
import { CANDIDATES } from "@/lib/data/candidates";

export const runtime = "nodejs";

/**
 * Retrieval + deterministic scoring. Fast and auditable, no model call.
 * The reasoning layer runs per-candidate in /api/evaluate, so the recruiter
 * sees ranked results immediately and pays for reasoning only where they look.
 */
export async function POST(req: Request) {
  if (!rateLimit(req, 60)) return tooMany();
  try {
    const body = await readJson<{ analysis?: unknown; topK?: number }>(req);
    const parsed = JobAnalysisSchema.safeParse(body?.analysis);
    if (!parsed.success) return badRequest("A valid job analysis is required.");
    const job: JobAnalysis = parsed.data;

    const query = job.searchQuery || `${job.role} ${job.requiredSkills.join(" ")} ${job.market}`;
    const retrieved = await retrieveCandidates(query, Math.min(body?.topK ?? 14, 20));

    // Recall guard: if semantic recall is thin, widen with the sector cohort
    // rather than silently returning a short list.
    const ids = new Set(retrieved.map((r) => r.candidate.id));
    const widened = [...retrieved.map((r) => r.candidate)];
    if (widened.length < 8) {
      for (const c of CANDIDATES) if (c.sector === job.sector && !ids.has(c.id)) widened.push(c);
    }

    const ranked = rank(job, widened).slice(0, 10);
    const retrievalScores = new Map(retrieved.map((r) => [r.candidate.id, r.score]));

    return NextResponse.json({
      retrieval: { mode: embeddingMode(), query, returned: retrieved.length, widened: widened.length > retrieved.length },
      results: ranked.map((r) => ({
        ...r,
        retrievalScore: Math.round((retrievalScores.get(r.candidate.id) ?? 0) * 1000) / 1000,
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}
