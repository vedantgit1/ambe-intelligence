import { NextResponse } from "next/server";
import { geminiConfigured, MODELS } from "@/lib/ai/gemini";
import { ragStatus } from "@/lib/rag";
import { REQUIREMENTS, SYSTEM_COUNTS } from "@/lib/data/business";

export const runtime = "nodejs";

export async function GET() {
  let rag: Awaited<ReturnType<typeof ragStatus>> | null = null;
  try { rag = await ragStatus(); } catch { rag = null; }
  return NextResponse.json({
    gemini: geminiConfigured() ? "connected" : "demo",
    models: { reasoning: MODELS.reasoning, fast: MODELS.fast, embedding: MODELS.embedding },
    retrieval: rag ? { store: rag.store, mode: rag.embeddingMode, chunks: rag.knowledgeChunks, vectors: rag.candidateVectors } : { store: "unavailable" },
    knowledgeBase: SYSTEM_COUNTS.knowledgeDocs,
    candidates: SYSTEM_COUNTS.candidates,
    requirements: REQUIREMENTS.length,
    dataMode: "Illustrative prototype data",
  });
}
