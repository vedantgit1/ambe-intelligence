"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, FileText } from "lucide-react";
import { AiThinking, Badge, Card, ErrorNote, List, PageHead, SectionHead, SourceTag } from "@/components/ui/primitives";
import { DECISIONS } from "@/lib/data/business";
import type { DecisionSupport } from "@/lib/ai/schema";
import type { RetrievedChunk } from "@/types";

export default function DecisionsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [res, setRes] = useState<Record<string, { data: DecisionSupport; source: "gemini" | "demo"; note?: string; sources: RetrievedChunk[] }>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function ask(id: string) {
    setOpenId(id); setLoading(id); setError("");
    try {
      const r = await fetch("/api/decision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decisionId: id }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setRes((p) => ({ ...p, [id]: j }));
    } catch (e) { setError(e instanceof Error ? e.message : "Request failed"); }
    finally { setLoading(null); }
  }

  return (
    <div>
      <PageHead title="Decision Log" sub="Executive decisions, their context, owner and impact — traceable after the fact."
        right={<Badge tone="neutral">{DECISIONS.filter((d) => d.status === "Under review").length} awaiting decision</Badge>} />

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-[12.5px] min-w-[860px]">
            <thead>
              <tr className="text-faint border-b border-line-soft">
                {["Decision", "Context", "Owner", "Date", "Status", "Impact", ""].map((h) => (
                  <th key={h} className="text-left font-normal px-4 py-3 text-[11px] tracking-wide uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISIONS.map((d) => (
                <tr key={d.id} className="border-b border-line-soft last:border-0 hover:bg-surface-2/60 transition-colors">
                  <td className="px-4 py-3.5 font-medium max-w-[220px]">{d.decision}</td>
                  <td className="px-4 py-3.5 text-muted max-w-[330px] leading-relaxed">{d.context}</td>
                  <td className="px-4 py-3.5 text-muted whitespace-nowrap">{d.owner}</td>
                  <td className="px-4 py-3.5 text-faint whitespace-nowrap">{d.date}</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={d.status === "Approved" ? "ok" : d.status === "Under review" ? "warn" : d.status === "Rejected" ? "danger" : "neutral"}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={d.impact === "High" ? "accent" : "neutral"}>{d.impact}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => ask(d.id)} className="btn !py-1.5"><Bot size={13} /> Ask AI</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {openId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3.5">
            <SectionHead
              title="Decision support"
              sub={DECISIONS.find((d) => d.id === openId)?.decision ?? ""}
              right={<div className="flex items-center gap-2"><SourceTag source={res[openId]?.source} note={res[openId]?.note} /><button onClick={() => setOpenId(null)} className="btn btn-ghost !text-[12px]">Close</button></div>}
            />
            <Card className="p-5">
              {loading === openId && <AiThinking steps={["Reading the decision context…", "Retrieving relevant internal policy…", "Framing the option set…", "Testing each option against constraints…", "Forming a recommendation…"]} />}
              {error && <ErrorNote message={error} />}
              {res[openId] && loading !== openId && (
                <div className="space-y-5 rise">
                  <p className="text-[13px] leading-relaxed text-muted">{res[openId].data.context}</p>

                  <div className="grid md:grid-cols-3 gap-2.5">
                    {res[openId].data.options.map((o, i) => (
                      <div key={i} className="rounded-[12px] border border-line-soft bg-surface p-3.5">
                        <p className="text-[12.5px] font-medium mb-2.5">{o.option}</p>
                        <p className="label mb-1.5">Pros</p>
                        <List items={o.pros} />
                        <p className="label mb-1.5 mt-3">Cons</p>
                        <List items={o.cons} />
                      </div>
                    ))}
                  </div>

                  <div><p className="label mb-2">Risks</p><List items={res[openId].data.risks} /></div>

                  <div className="rounded-[13px] border border-[#4a3a1c] bg-[rgba(226,172,79,0.06)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="label">Recommendation</p>
                      <Badge tone={res[openId].data.confidence >= 70 ? "ok" : "warn"}>Confidence {res[openId].data.confidence}%</Badge>
                      <Badge tone={res[openId].data.reversibility === "one-way" ? "danger" : "teal"}>{res[openId].data.reversibility} door</Badge>
                    </div>
                    <p className="text-[13px] leading-relaxed">{res[openId].data.recommendation}</p>
                    {res[openId].data.whatWouldChangeMyMind.length > 0 && (
                      <>
                        <p className="label mb-1.5 mt-3">What would change this view</p>
                        <List items={res[openId].data.whatWouldChangeMyMind} />
                      </>
                    )}
                  </div>

                  {res[openId].sources?.length > 0 && (
                    <div>
                      <p className="label mb-2">Sources used</p>
                      <div className="space-y-1.5">
                        {res[openId].sources.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11.5px]">
                            <FileText size={12} className="text-teal shrink-0" />
                            <span className="text-muted">{s.docTitle}</span>
                            <span className="text-faint">— {s.section}</span>
                            <span className="ml-auto chip">rel {s.score.toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-faint border-t border-line-soft pt-4">
                    Decision support only. The named owner makes the decision and the log records who decided what, and when.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
