import { CANDIDATES } from "@/lib/data/candidates";
import { embedOne, embedTexts, type EmbeddingMode } from "@/lib/rag/embeddings";
import { KNOWLEDGE } from "@/lib/rag/knowledge";
import { createVectorStore, type VectorStore } from "@/lib/vector/store";
import type { Candidate, RetrievedChunk } from "@/types";

/**
 * RAG pipeline:
 *   documents -> chunking -> embeddings -> vector store -> similarity search
 *   -> retrieved context -> Gemini -> grounded answer
 *
 * Two indexes share one store abstraction: knowledge chunks (for grounding
 * answers) and candidate profiles (for talent retrieval).
 */

let knowledgeStore: VectorStore | null = null;
let candidateStore: VectorStore | null = null;
let indexMode: EmbeddingMode = "lexical";
let building: Promise<void> | null = null;

/** Chunks a section into overlapping windows on sentence boundaries. */
export function chunk(text: string, maxChars = 700, overlap = 120): string[] {
  const sentences = text.split(/(?<=\.)\s+/);
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur.length + s.length > maxChars && cur) {
      out.push(cur.trim());
      cur = cur.slice(Math.max(0, cur.length - overlap));
    }
    cur += ` ${s}`;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function candidateDocument(c: Candidate): string {
  return [
    `${c.name} — ${c.role} (${c.sector}).`,
    `${c.years} years of experience. Based in ${c.location}.`,
    `Skills: ${c.skills.join(", ")}.`,
    `Certifications: ${c.certifications.join(", ") || "none recorded"}.`,
    `Languages: ${c.languages.join(", ")}.`,
    `GCC experience: ${c.gccExperience ? "yes" : "no"}. Availability: ${c.availability.replace("_", " ")}.`,
    c.summary,
  ].join(" ");
}

export async function ensureIndex(): Promise<void> {
  if (building) return building;
  building = (async () => {
    const kStore = createVectorStore();
    const cStore = createVectorStore();

    const kTexts: string[] = [];
    const kMeta: Record<string, unknown>[] = [];
    for (const doc of KNOWLEDGE) {
      for (const sec of doc.sections) {
        for (const [i, part] of chunk(sec.body).entries()) {
          kTexts.push(`${doc.title} — ${sec.heading}: ${part}`);
          kMeta.push({ docId: doc.id, docTitle: doc.title, section: sec.heading, text: part, i });
        }
      }
    }
    const kEmb = await embedTexts(kTexts);
    indexMode = kEmb.mode;
    await kStore.upsert(kEmb.vectors.map((v, i) => ({ id: `${kMeta[i].docId}-${kMeta[i].section}-${kMeta[i].i}`, vector: v, metadata: kMeta[i] })));

    const cTexts = CANDIDATES.map(candidateDocument);
    const cEmb = await embedTexts(cTexts);
    await cStore.upsert(cEmb.vectors.map((v, i) => ({ id: CANDIDATES[i].id, vector: v, metadata: { id: CANDIDATES[i].id } })));

    knowledgeStore = kStore;
    candidateStore = cStore;
  })();
  return building;
}

export async function retrieveKnowledge(query: string, topK = 4): Promise<RetrievedChunk[]> {
  await ensureIndex();
  const { vector } = await embedOne(query);
  const hits = await knowledgeStore!.query(vector, topK);
  return hits
    .filter((h) => h.score > 0.02)
    .map((h) => ({
      docId: String(h.metadata.docId),
      docTitle: String(h.metadata.docTitle),
      section: String(h.metadata.section),
      text: String(h.metadata.text),
      score: Math.round(h.score * 1000) / 1000,
    }));
}

/** Semantic candidate retrieval — the recall stage before deterministic scoring. */
export async function retrieveCandidates(query: string, topK = 12): Promise<{ candidate: Candidate; score: number }[]> {
  await ensureIndex();
  const { vector } = await embedOne(query);
  const hits = await candidateStore!.query(vector, topK);
  const byId = new Map(CANDIDATES.map((c) => [c.id, c]));
  return hits
    .map((h) => ({ candidate: byId.get(h.id)!, score: h.score }))
    .filter((r) => Boolean(r.candidate));
}

export async function ragStatus() {
  await ensureIndex();
  return {
    store: createVectorStore().name,
    embeddingMode: indexMode,
    knowledgeChunks: await knowledgeStore!.size(),
    candidateVectors: await candidateStore!.size(),
    documents: KNOWLEDGE.length,
  };
}

export const formatChunks = (chunks: RetrievedChunk[]) =>
  chunks.map((c, i) => `[${i + 1}] ${c.docTitle} — ${c.section}\n${c.text}`).join("\n\n");
