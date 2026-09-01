/**
 * Retrieval is written against an interface, not a vendor.
 * The prototype runs on InMemoryVectorStore; PineconeVectorStore is selected
 * automatically when PINECONE_API_KEY and PINECONE_INDEX are both present.
 * Nothing above this layer knows which one is in use.
 */

export interface VectorRecord {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
}

export interface VectorHit {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface VectorStore {
  readonly name: string;
  upsert(records: VectorRecord[]): Promise<void>;
  query(vector: number[], topK: number, filter?: (m: Record<string, unknown>) => boolean): Promise<VectorHit[]>;
  size(): Promise<number>;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Exact brute-force search. Correct and fast at prototype cardinality (<10k). */
export class InMemoryVectorStore implements VectorStore {
  readonly name = "InMemoryVectorStore";
  private records = new Map<string, VectorRecord>();

  async upsert(records: VectorRecord[]): Promise<void> {
    for (const r of records) this.records.set(r.id, r);
  }

  async query(vector: number[], topK: number, filter?: (m: Record<string, unknown>) => boolean): Promise<VectorHit[]> {
    const out: VectorHit[] = [];
    for (const r of this.records.values()) {
      if (filter && !filter(r.metadata)) continue;
      out.push({ id: r.id, score: cosine(vector, r.vector), metadata: r.metadata });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async size(): Promise<number> { return this.records.size; }
}

/**
 * Optional managed-vector-database adapter. Deliberately dependency-free
 * (plain REST) so the prototype never carries an unused SDK. Not exercised in
 * the demo; it exists to show the seam where production retrieval moves.
 */
export class PineconeVectorStore implements VectorStore {
  readonly name = "PineconeVectorStore";
  constructor(private apiKey: string, private indexHost: string, private namespace = "ambe") {}

  async upsert(records: VectorRecord[]): Promise<void> {
    await fetch(`${this.indexHost}/vectors/upsert`, {
      method: "POST",
      headers: { "Api-Key": this.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        namespace: this.namespace,
        vectors: records.map((r) => ({ id: r.id, values: r.vector, metadata: r.metadata })),
      }),
    });
  }

  async query(vector: number[], topK: number): Promise<VectorHit[]> {
    const res = await fetch(`${this.indexHost}/query`, {
      method: "POST",
      headers: { "Api-Key": this.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ namespace: this.namespace, vector, topK, includeMetadata: true }),
    });
    const json = (await res.json()) as { matches?: { id: string; score: number; metadata?: Record<string, unknown> }[] };
    return (json.matches ?? []).map((m) => ({ id: m.id, score: m.score, metadata: m.metadata ?? {} }));
  }

  async size(): Promise<number> { return -1; }
}

export function createVectorStore(): VectorStore {
  const key = process.env.PINECONE_API_KEY?.trim();
  const host = process.env.PINECONE_INDEX?.trim();
  if (key && host) return new PineconeVectorStore(key, host.startsWith("http") ? host : `https://${host}`);
  return new InMemoryVectorStore();
}
