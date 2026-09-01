"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Sparkles } from "lucide-react";
import {
  AiThinking, Badge, Bar as Meter, Card, DemoTag, ErrorNote, List, PageHead, SectionHead, SourceTag,
} from "@/components/ui/primitives";
import { biggestBottleneck, funnelConversions } from "@/lib/analytics/metrics";
import { CLIENT_DEMAND, MARKETS, RECRUITER_PRODUCTIVITY } from "@/lib/data/business";
import type { Diagnosis } from "@/lib/ai/schema";
import type { RetrievedChunk } from "@/types";

const ROWS = funnelConversions();
const BN = biggestBottleneck();
const MAX_STAGE = Math.max(...ROWS.map((r) => r.count));

export default function AnalyticsPage() {
  const [res, setRes] = useState<{ data: Diagnosis; source: "gemini" | "demo"; note?: string; sources: RetrievedChunk[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function diagnose() {
    setLoading(true); setError(""); setRes(null);
    try {
      const r = await fetch("/api/diagnose", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setRes(j);
    } catch (e) { setError(e instanceof Error ? e.message : "Diagnosis failed"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHead title="Recruitment Funnel" sub="Where volume enters, where it converts, and where it stalls."
        right={<button onClick={diagnose} disabled={loading} className="btn btn-primary"><Sparkles size={14} /> Diagnose with AI</button>} />

      <div className="flex items-start gap-3 rounded-[13px] border border-[#4a3a1c] bg-[rgba(226,172,79,0.06)] px-4 py-3 mb-3.5">
        <AlertTriangle size={15} className="text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-[12.5px]"><span className="text-accent font-medium">Anomaly detected:</span> {BN.stage} is the largest conversion loss in the funnel at {BN.conversion}% with {BN.avgDays} days average dwell.</p>
          <p className="text-[11px] text-faint mt-0.5">Computed from the seeded funnel, not asserted by the model.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-3.5">
        <Card className="p-5 lg:col-span-3">
          <SectionHead title="Stage-by-stage" sub="Volume, conversion from previous stage, and time in stage" right={<DemoTag />} />
          <div className="space-y-2.5">
            {ROWS.map((r, i) => (
              <div key={r.stage}>
                <div className="flex items-baseline justify-between text-[12px] mb-1">
                  <span className={r.stage === BN.stage ? "text-accent font-medium" : "text-muted"}>{r.stage}</span>
                  <span className="text-faint">
                    <span className="text-fg">{r.count.toLocaleString()}</span>
                    {i > 0 && <> · {r.conversion}% conv. · {r.avgDays}d</>}
                  </span>
                </div>
                <Meter value={(r.count / MAX_STAGE) * 100} tone={r.stage === BN.stage ? "danger" : "accent"} height={7} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Recruiter productivity" sub="By team, this month" right={<DemoTag />} />
          <div className="h-[230px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RECRUITER_PRODUCTIVITY}>
                <CartesianGrid stroke="#1b2025" vertical={false} />
                <XAxis dataKey="recruiter" stroke="#63707b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.split(" ")[1]} />
                <YAxis stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} width={34} />
                <Tooltip contentStyle={{ background: "#111417", border: "1px solid #22272c", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="screened" fill="#2f3941" radius={[5, 5, 0, 0]} name="Screened" />
                <Bar dataKey="deployed" fill="#e2ac4f" radius={[5, 5, 0, 0]} name="Deployed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {RECRUITER_PRODUCTIVITY.map((r) => (
              <div key={r.recruiter} className="flex justify-between text-[11.5px]">
                <span className="text-muted truncate">{r.recruiter}</span>
                <span className="text-faint">{Math.round((r.deployed / r.screened) * 100)}% screen→deploy</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-3.5 mt-3.5">
        <Card className="p-5">
          <SectionHead title="Market breakdown" sub="Pipeline by destination market" right={<DemoTag />} />
          <div className="h-[220px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MARKETS}>
                <CartesianGrid stroke="#1b2025" vertical={false} />
                <XAxis dataKey="market" stroke="#63707b" fontSize={9.5} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.split(" ")[0]} />
                <YAxis stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} width={38} />
                <Tooltip contentStyle={{ background: "#111417", border: "1px solid #22272c", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="pipeline" radius={[5, 5, 0, 0]} name="Pipeline">
                  {MARKETS.map((m, i) => <Cell key={i} fill={m.opportunityScore >= 84 ? "#e2ac4f" : "#2f3941"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead title="Client breakdown" sub="Open positions and week-over-week movement" right={<DemoTag />} />
          <div className="space-y-2.5 pt-1">
            {CLIENT_DEMAND.map((c) => (
              <div key={c.client}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-muted">{c.client}</span>
                  <span className="text-faint"><span className="text-fg">{c.open}</span> open · <span className={c.wow > 0 ? "text-ok" : "text-danger"}>{c.wow > 0 ? "+" : ""}{c.wow}%</span></span>
                </div>
                <Meter value={(c.open / 130) * 100} tone={c.wow > 20 ? "accent" : "teal"} height={6} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-3.5">
        <SectionHead title="AI diagnosis" sub="Bottleneck, likely causes, and interventions ranked by effort" right={<SourceTag source={res?.source} note={res?.note} />} />
        <Card className="p-5">
          {!res && !loading && !error && (
            <p className="text-[12.5px] text-faint py-6 text-center">
              Run <span className="text-accent">Diagnose with AI</span> to have the model explain the anomaly above, grounded in the deployment workflow documents.
            </p>
          )}
          {loading && <AiThinking steps={["Reading funnel conversion and dwell times…", "Retrieving deployment workflow knowledge…", "Isolating the binding constraint…", "Ranking interventions by effort and impact…"]} />}
          {error && <ErrorNote message={error} />}
          {res && (
            <div className="space-y-5 rise">
              <div className="rounded-[12px] border border-[#4a2622] bg-[rgba(224,112,95,0.06)] px-3.5 py-3">
                <p className="label mb-1.5">Bottleneck</p>
                <p className="text-[13.5px]">{res.data.bottleneck}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="label mb-2">Evidence</p><List items={res.data.evidence} /></div>
                <div>
                  <p className="label mb-2">Likely causes</p>
                  <div className="space-y-1.5">
                    {res.data.likelyCauses.map((c, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 text-[12.5px]">
                        <span className="text-muted">{c.cause}</span>
                        <Badge tone={c.confidence === "high" ? "ok" : c.confidence === "medium" ? "warn" : "neutral"}>{c.confidence}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="label mb-2">Interventions</p>
                <div className="grid md:grid-cols-3 gap-2">
                  {res.data.interventions.map((x, i) => (
                    <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                      <p className="text-[12.5px]">{x.intervention}</p>
                      <div className="flex gap-1.5 mt-2">
                        <Badge tone={x.effort === "low" ? "ok" : x.effort === "medium" ? "warn" : "danger"}>{x.effort} effort</Badge>
                        <Badge>{x.owner}</Badge>
                      </div>
                      <p className="text-[11.5px] text-teal mt-1.5">{x.expectedImpact}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="label mb-2">Leading indicators to watch</p><List items={res.data.leadingIndicators} /></div>
                <div>
                  <p className="label mb-2">If ignored</p>
                  <p className="text-[12.5px] text-muted leading-relaxed">{res.data.ifIgnored}</p>
                </div>
              </div>
              {res.sources?.length > 0 && (
                <p className="text-[11px] text-faint border-t border-line-soft pt-3">
                  Grounded in: {res.sources.map((s) => `${s.docTitle} — ${s.section}`).join(" · ")}
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
