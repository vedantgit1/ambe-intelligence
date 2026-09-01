"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Compass, Sparkles } from "lucide-react";
import {
  AiThinking, Badge, Bar, Card, ErrorNote, List, PageHead, SectionHead, SourceTag,
} from "@/components/ui/primitives";
import { PRIORITIES } from "@/lib/data/business";
import type { StrategyPlan } from "@/lib/ai/schema";

export default function StrategyPage() {
  const [selected, setSelected] = useState(PRIORITIES[0].id);
  const [plans, setPlans] = useState<Record<string, { data: StrategyPlan; source: "gemini" | "demo"; note?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const p = PRIORITIES.find((x) => x.id === selected)!;
  const plan = plans[selected];

  async function generate() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/strategy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priorityId: selected }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setPlans((prev) => ({ ...prev, [selected]: j }));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not generate the plan"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHead title="Strategy Room" sub="Turn leadership priorities into measurable execution."
        right={<Badge tone="neutral">Objective → Owner → Milestones → KPIs → Next decision</Badge>} />

      <div className="grid lg:grid-cols-3 gap-3.5 mb-4">
        {PRIORITIES.map((x, i) => (
          <Card key={x.id} hover delay={i * 0.06} className={`p-4 cursor-pointer ${selected === x.id ? "!border-[#4a3a1c]" : ""}`}>
            <div onClick={() => setSelected(x.id)}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[22px] font-semibold text-faint leading-none">{x.index}</span>
                <Badge tone={x.status === "On track" ? "ok" : x.status === "At risk" ? "danger" : "warn"}>{x.status}</Badge>
              </div>
              <p className="text-[13.5px] font-medium mt-3 leading-snug">{x.title}</p>
              <p className="text-[11.5px] text-faint mt-1.5">{x.owner}</p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-faint">Progress</span>
                  <span className="text-muted">{x.progress}%</span>
                </div>
                <Bar value={x.progress} tone={x.status === "At risk" ? "danger" : x.status === "On track" ? "ok" : "accent"} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-3.5">
        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Initiative detail" sub={`${p.index} · ${p.owner}`} />
          <div className="space-y-4">
            <div>
              <p className="label mb-1.5">Objective</p>
              <p className="text-[12.5px] text-muted leading-relaxed">{p.objective}</p>
            </div>
            <div>
              <p className="label mb-2">Milestones</p>
              <div className="space-y-1.5">
                {p.milestones.map((m) => (
                  <div key={m.label} className="flex items-center gap-2 text-[12.5px]">
                    {m.done ? <CheckCircle2 size={13} className="text-ok shrink-0" /> : <Circle size={13} className="text-faint shrink-0" />}
                    <span className={m.done ? "text-muted line-through decoration-faint" : "text-fg"}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div><p className="label mb-2">Dependencies</p><List items={p.dependencies} /></div>
            <div><p className="label mb-2">KPIs</p><div className="flex flex-wrap gap-1.5">{p.kpis.map((k) => <Badge key={k} tone="teal">{k}</Badge>)}</div></div>
            <div><p className="label mb-2">Risks</p><List items={p.risks} /></div>
            <div className="rounded-[12px] border border-[#4a3a1c] bg-[rgba(226,172,79,0.06)] px-3.5 py-3">
              <p className="label mb-1.5">Next decision</p>
              <p className="text-[12.5px] leading-relaxed">{p.nextDecision}</p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <SectionHead title="AI action plan" sub="Sequenced, owned and measurable" right={<SourceTag source={plan?.source} note={plan?.note} />} />
          <Card className="p-5 min-h-[440px]">
            {!plan && !loading && !error && (
              <div className="flex flex-col items-center text-center py-16">
                <div className="grid place-items-center w-12 h-12 rounded-2xl border border-line bg-surface-2 mb-4"><Compass size={20} className="text-accent" /></div>
                <p className="text-[14px] font-medium">Generate an action plan for &ldquo;{p.title}&rdquo;</p>
                <p className="text-[12.5px] text-faint mt-1.5 max-w-lg leading-relaxed">
                  Returns objective, initiatives, sequencing, owner recommendations, dependencies, KPI targets, risks and
                  the next seven days of work.
                </p>
                <button onClick={generate} className="btn btn-primary mt-5"><Sparkles size={14} /> Generate Action Plan</button>
              </div>
            )}
            {loading && <AiThinking steps={["Reading the priority and its dependencies…", "Locating the binding constraint…", "Sequencing phases against lead times…", "Assigning owners and KPI targets…", "Writing the 7-day plan…"]} />}
            {error && <ErrorNote message={error} />}
            <AnimatePresence>
              {plan && !loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div>
                    <p className="label mb-1.5">Objective</p>
                    <p className="text-[13px] leading-relaxed">{plan.data.objective}</p>
                  </div>

                  <div>
                    <p className="label mb-2">Initiatives</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {plan.data.initiatives.map((x, i) => (
                        <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                          <p className="text-[12.5px] font-medium">{x.name}</p>
                          <p className="text-[11.5px] text-muted mt-1">{x.outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="label mb-2">Sequencing</p>
                    <div className="relative pl-4">
                      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-line" />
                      <div className="space-y-3">
                        {plan.data.sequencing.map((s, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-4 top-1.5 w-[9px] h-[9px] rounded-full border border-accent bg-base" />
                            <p className="text-[12.5px] font-medium">{s.phase} <span className="text-faint font-normal">· {s.weeks}</span></p>
                            <p className="text-[11.5px] text-muted mt-0.5">{s.focus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="label mb-2">Owner recommendations</p>
                      <div className="space-y-1.5">
                        {plan.data.ownerRecommendations.map((o, i) => (
                          <div key={i} className="text-[12px]">
                            <span className="text-fg">{o.workstream}</span>
                            <span className="text-faint"> → </span>
                            <span className="text-accent">{o.owner}</span>
                            <p className="text-[11px] text-muted">{o.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="label mb-2">KPIs</p>
                      <div className="space-y-1.5">
                        {plan.data.kpis.map((k, i) => (
                          <div key={i} className="flex items-baseline justify-between gap-2 text-[12px] border-b border-line-soft pb-1.5 last:border-0">
                            <span className="text-muted">{k.kpi}</span>
                            <span className="text-fg whitespace-nowrap">{k.target} <span className="text-faint">· {k.cadence}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="label mb-2">Risks and mitigations</p>
                    <div className="space-y-2">
                      {plan.data.risks.map((r, i) => (
                        <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                          <p className="text-[12.5px]">{r.risk}</p>
                          <p className="text-[11.5px] text-teal mt-1">{r.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[13px] border border-[#4a3a1c] bg-[rgba(226,172,79,0.06)] p-4">
                    <p className="label mb-2.5">Next 7 days</p>
                    <div className="space-y-2">
                      {plan.data.next7Days.map((a, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[12px] font-semibold text-accent mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <p className="text-[12.5px]">{a.action}</p>
                            <p className="text-[11px] text-faint mt-0.5">{a.owner} · {a.by}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10.5px] text-faint">Grounded in illustrative prototype data · leadership decides</span>
                    <button onClick={generate} className="btn btn-ghost !text-[12px]">Regenerate</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}
