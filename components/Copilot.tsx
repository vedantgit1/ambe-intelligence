"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, FileText, X } from "lucide-react";
import { AiThinking, Badge, ErrorNote, List, SourceTag } from "@/components/ui/primitives";
import type { RetrievedChunk } from "@/types";

interface Answer {
  answer: string;
  keyPoints: string[];
  recommendedActions: { action: string; owner: string; by: string }[];
  confidence: number;
  usedRetrieval: boolean;
}

const SUGGESTIONS = [
  "Why did placements fall this week?",
  "Which recruitment requirements are at risk?",
  "What should leadership focus on today?",
  "Find the bottleneck in the candidate pipeline.",
  "Give me a 7-day action plan.",
  "How could AI reduce recruiter workload?",
  "Identify the biggest opportunity in the current data.",
  "Summarize today's operational risks.",
];

export function Copilot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<{ data: Answer; source: "gemini" | "demo"; note?: string; sources: RetrievedChunk[] } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  async function ask(question: string) {
    if (!question.trim()) return;
    setQ(question); setLoading(true); setError(""); setRes(null);
    try {
      const r = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setRes(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.3, 1] }}
            className="fixed left-1/2 top-[7vh] z-50 w-[min(760px,94vw)] -translate-x-1/2 card p-0 overflow-hidden max-h-[86vh] flex flex-col"
          >
            <div className="flex items-center gap-2.5 px-5 h-14 border-b border-line-soft shrink-0">
              <Bot size={16} className="text-accent" />
              <div className="text-[13.5px] font-semibold">AI Chief of Staff Copilot</div>
              <Badge tone="neutral" className="ml-1">grounded on seeded operating data + internal documents</Badge>
              <button onClick={onClose} className="ml-auto btn btn-ghost !px-2"><X size={15} /></button>
            </div>

            <div className="px-5 py-4 overflow-y-auto scroll-thin flex-1">
              {!res && !loading && !error && (
                <div className="space-y-3">
                  <p className="label">Executive prompts</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => ask(s)}
                        className="text-left text-[12.5px] text-muted hover:text-fg rounded-[11px] border border-line-soft hover:border-line bg-surface px-3 py-2.5 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <AiThinking steps={["Reading the operating picture…", "Searching internal knowledge base…", "Retrieving top-k passages…", "Reasoning over evidence…", "Drafting the recommendation…"]} />
              )}

              {error && <ErrorNote message={error} />}

              {res && (
                <div className="space-y-5 rise">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SourceTag source={res.source} note={res.note} />
                    <Badge tone={res.data.confidence >= 70 ? "ok" : "warn"}>Confidence {res.data.confidence}%</Badge>
                    {res.sources?.length > 0 && <Badge tone="teal">RAG · {res.sources.length} passages</Badge>}
                  </div>

                  <div className="prose-ai text-[13.5px] text-muted whitespace-pre-wrap leading-relaxed">
                    {renderMarkdownish(res.data.answer)}
                  </div>

                  {res.data.keyPoints?.length > 0 && (
                    <div>
                      <p className="label mb-2">Key points</p>
                      <List items={res.data.keyPoints} />
                    </div>
                  )}

                  {res.data.recommendedActions?.length > 0 && (
                    <div>
                      <p className="label mb-2">Recommended actions</p>
                      <div className="space-y-2">
                        {res.data.recommendedActions.map((a, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                            <span className="text-[11px] text-faint mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                            <div className="min-w-0">
                              <div className="text-[12.5px] text-fg">{a.action}</div>
                              <div className="text-[11px] text-faint mt-0.5">{a.owner} · {a.by}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {res.sources?.length > 0 && (
                    <div>
                      <p className="label mb-2">Sources used</p>
                      <div className="space-y-1.5">
                        {res.sources.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11.5px] text-faint">
                            <FileText size={12} className="text-teal shrink-0" />
                            <span className="text-muted">{s.docTitle}</span>
                            <span className="text-faint">— {s.section}</span>
                            <span className="ml-auto chip">rel {s.score.toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-line-soft shrink-0">
              <div className="flex items-end gap-2 rounded-[13px] border border-line-soft bg-surface px-3 py-2 focus-within:border-line">
                <textarea
                  ref={inputRef} rows={1} value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(q); } }}
                  placeholder="Ask about the pipeline, risks, markets or what leadership should do next…"
                  className="flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-faint py-1"
                />
                <button onClick={() => ask(q)} disabled={loading || !q.trim()} className="btn btn-primary !px-2.5 !py-1.5">
                  <ArrowUp size={14} />
                </button>
              </div>
              <p className="text-[10.5px] text-faint mt-2">AI assists leadership judgement; humans make the decisions. Answers draw on illustrative prototype data.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Minimal markdown rendering: bold + paragraphs. No external dependency. */
export function renderMarkdownish(text: string) {
  return text.split(/\n{2,}/).map((para, i) => (
    <p key={i} className="mb-2.5">
      {para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
        seg.startsWith("**") && seg.endsWith("**") ? <strong key={j} className="text-fg font-semibold">{seg.slice(2, -2)}</strong> : <span key={j}>{seg}</span>,
      )}
    </p>
  ));
}
