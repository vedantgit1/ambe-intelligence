"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import {
  AiThinking, Badge, Card, DemoTag, ErrorNote, List, PageHead, SectionHead, SourceTag,
} from "@/components/ui/primitives";
import { SKILL_PIPELINE } from "@/lib/data/business";
import type { SkillGapAnalysis } from "@/lib/ai/schema";

const STAGE_LABELS = ["MARKET DEMAND", "SKILL GAP", "TRAINING", "ASSESSMENT", "CERTIFICATION", "MATCH", "EMPLOYMENT"];

export default function SkillsPage() {
  const [res, setRes] = useState<{ data: SkillGapAnalysis; source: "gemini" | "demo"; note?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true); setError(""); setRes(null);
    try {
      const r = await fetch("/api/skill-gap", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setRes(j);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); }
    finally { setLoading(false); }
  }

  const max = Math.max(...SKILL_PIPELINE.stages.map((s) => s.value));

  return (
    <div>
      <PageHead
        title="Skill-to-Opportunity"
        sub="Turn workforce demand into measurable employability."
        right={<button onClick={analyze} disabled={loading} className="btn btn-primary"><Sparkles size={14} /> Analyze Skill Gap</button>}
      />

      <Card className="p-5 mb-3.5">
        <SectionHead title="The chain" sub="Each link has a conversion rate; the weakest link caps the whole chain" right={<DemoTag />} />
        <div className="flex flex-wrap items-stretch gap-1.5">
          {SKILL_PIPELINE.stages.map((s, i) => {
            const w = (s.value / max) * 100;
            return (
              <motion.div
                key={s.stage}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="flex-1 min-w-[130px] rounded-[13px] border border-line-soft bg-surface p-3 relative overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#1b2025]">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.9, delay: i * 0.07 }}
                    className="h-full" style={{ background: i === 1 ? "var(--color-danger)" : i >= 5 ? "var(--color-ok)" : "var(--color-accent)" }} />
                </div>
                <p className="text-[9.5px] tracking-[0.09em] text-faint">{STAGE_LABELS[i]}</p>
                <p className="text-[22px] font-semibold mt-1 leading-none">{s.value}</p>
                <p className="text-[10.5px] text-faint mt-1.5 leading-snug">{s.note}</p>
                {i < SKILL_PIPELINE.stages.length - 1 && (
                  <ArrowRight size={12} className="absolute -right-[7px] top-1/2 -translate-y-1/2 text-faint hidden xl:block" />
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      <div className="grid lg:grid-cols-5 gap-3.5">
        <Card className="p-5 lg:col-span-2">
          <SectionHead title={SKILL_PIPELINE.trade} sub="Worked example" right={<DemoTag />} />
          <div className="space-y-2.5">
            <Stat k="Market demand" v={`${SKILL_PIPELINE.marketDemand} welders`} />
            <Stat k="Current qualified pool" v={`${SKILL_PIPELINE.qualifiedPool}`} />
            <Stat k="Gap" v={`${SKILL_PIPELINE.gap}`} tone="danger" />
            <Stat k="Recommended training capacity" v={SKILL_PIPELINE.recommendedTrainingCapacity} tone="accent" />
            <Stat k="Projected deployment" v={SKILL_PIPELINE.projectedDeployment} tone="ok" />
          </div>
          <p className="text-[11.5px] text-faint mt-4 leading-relaxed">
            Gap = forecast demand − qualified and available pool. Counting the unqualified pool as supply is the most
            common planning error, and it is why training volume alone does not produce placements.
          </p>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <SectionHead title="Demand vs qualified supply" sub="By trade" right={<DemoTag />} />
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SKILL_PIPELINE.trades}>
                <CartesianGrid stroke="#1b2025" vertical={false} />
                <XAxis dataKey="trade" stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} width={38} />
                <Tooltip contentStyle={{ background: "#111417", border: "1px solid #22272c", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="demand" fill="#2f3941" radius={[5, 5, 0, 0]} name="Demand" />
                <Bar dataKey="gap" radius={[5, 5, 0, 0]} name="Gap">
                  {SKILL_PIPELINE.trades.map((t, i) => <Cell key={i} fill={t.gap > 150 ? "#e0705f" : t.gap > 80 ? "#e2ac4f" : "#4fc3ae"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-3.5">
        <SectionHead title="AI skill-gap analysis" sub="Demand → training → assessment → certification → placement" right={<SourceTag source={res?.source} note={res?.note} />} />
        <Card className="p-5">
          {!res && !loading && !error && (
            <div className="flex flex-col items-center text-center py-12">
              <div className="grid place-items-center w-12 h-12 rounded-2xl border border-line bg-surface-2 mb-4"><GraduationCap size={20} className="text-accent" /></div>
              <p className="text-[14px] font-medium">Analyze the skill gap</p>
              <p className="text-[12.5px] text-faint mt-1.5 max-w-lg leading-relaxed">
                Returns the highest-demand skills, where the shortages actually bind, the training programmes that close
                them, expected impact, risks and the next seven days of work.
              </p>
              <button onClick={analyze} className="btn btn-primary mt-5"><Sparkles size={14} /> Analyze Skill Gap</button>
            </div>
          )}
          {loading && <AiThinking steps={["Reading demand and supply by trade…", "Computing coverable vs uncoverable demand…", "Sizing cohorts against assessment throughput…", "Modelling deployment conversion…", "Writing the recommendation…"]} />}
          {error && <ErrorNote message={error} />}
          {res && (
            <div className="space-y-5 rise">
              <p className="text-[14px] leading-relaxed">{res.data.headline}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="label mb-2">Highest-demand skills</p>
                  <div className="space-y-2">
                    {res.data.highestDemandSkills.map((s, i) => (
                      <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                        <p className="text-[12.5px] font-medium">{s.skill}</p>
                        <p className="text-[11.5px] text-muted mt-1">{s.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label mb-2">Shortages</p>
                  <div className="space-y-2">
                    {res.data.shortages.map((s, i) => (
                      <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                        <div className="flex justify-between gap-2">
                          <p className="text-[12.5px] font-medium">{s.trade}</p>
                          <Badge tone="danger">gap {s.gap}</Badge>
                        </div>
                        <p className="text-[11.5px] text-muted mt-1">{s.implication}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="label mb-2">Recommended training</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {res.data.recommendedTraining.map((t, i) => (
                    <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                      <p className="text-[12.5px] font-medium">{t.program}</p>
                      <div className="flex gap-1.5 mt-1.5">
                        <Badge tone="accent">cohort {t.cohortSize}</Badge>
                        <Badge>{t.durationWeeks} weeks</Badge>
                      </div>
                      <p className="text-[11.5px] text-muted mt-1.5">{t.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-2.5">
                <Impact k="Projected placements" v={res.data.expectedImpact.placements} />
                <Impact k="Time to deploy" v={res.data.expectedImpact.timeToDeployWeeks} />
                <Impact k="Conversion uplift" v={res.data.expectedImpact.conversionUplift} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="label mb-2">Risks</p><List items={res.data.risks} /></div>
                <div><p className="label mb-2">Next 7 days</p><List items={res.data.next7Days} /></div>
              </div>

              <p className="text-[11px] text-faint leading-relaxed border-t border-line-soft pt-4">
                This is an operator&apos;s framework aligned with the direction of national skilling policy — mapping training to
                recognised qualification levels so certification stays portable. It is a concept demonstration, not a
                government system, and carries no official status.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: string }) {
  const c = tone === "danger" ? "text-danger" : tone === "ok" ? "text-ok" : tone === "accent" ? "text-accent" : "text-fg";
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line-soft pb-2 last:border-0">
      <span className="text-[12px] text-muted">{k}</span>
      <span className={`text-[14px] font-medium ${c}`}>{v}</span>
    </div>
  );
}

function Impact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[12px] border border-[#1c3f3a] bg-[rgba(79,195,174,0.06)] px-3 py-3">
      <p className="label mb-1">{k}</p>
      <p className="text-[12.5px] text-fg leading-relaxed">{v}</p>
    </div>
  );
}
