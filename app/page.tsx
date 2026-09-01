"use client";

import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import {
  AiThinking, Badge, Card, Counter, DemoTag, ErrorNote, List, PageHead, SectionHead, SourceTag,
} from "@/components/ui/primitives";
import { renderMarkdownish } from "@/components/Copilot";
import { ATTENTION, CLIENT_DEMAND, KPIS, THROUGHPUT } from "@/lib/data/business";
import { funnelConversions } from "@/lib/analytics/metrics";
import type { ExecutiveBrief } from "@/lib/ai/schema";

const CONV = funnelConversions().filter((s) =>
  ["Requirements", "Qualified", "Shortlisted", "Selected", "Deployed"].includes(s.stage),
);

export default function CommandCenter() {
  const [brief, setBrief] = useState<{ data: ExecutiveBrief; source: "gemini" | "demo"; note?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("run") === "brief") generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true); setError(""); setBrief(null);
    try {
      const r = await fetch("/api/brief", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setBrief(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the brief");
    } finally { setLoading(false); }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageHead
        title={`${greeting}, Vedant`}
        sub="Executive workforce intelligence"
        right={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">Data → Intelligence → Decision → Action → Measurement</Badge>
            <button onClick={generate} disabled={loading} className="btn btn-primary">
              <Sparkles size={14} /> Generate Today&apos;s Brief
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {KPIS.map((k, i) => (
          <Card key={k.key} hover delay={i * 0.05} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="label">{k.label}</p>
              {k.tone === "positive" ? <TrendingUp size={14} className="text-ok" /> : k.tone === "negative" ? <TrendingDown size={14} className="text-danger" /> : null}
            </div>
            <div className="mt-2 text-[30px] font-semibold tracking-[-0.03em] leading-none">
              <Counter value={k.value} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className={`text-[11.5px] ${k.tone === "positive" ? "text-ok" : k.tone === "negative" ? "text-danger" : "text-muted"}`}>{k.delta}</span>
              <DemoTag>{k.sub}</DemoTag>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3.5 mb-6">
        <Card className="p-5 lg:col-span-2" delay={0.08}>
          <SectionHead title="Executive pulse" sub="Recruitment throughput over the last seven weeks" right={<DemoTag />} />
          <div className="h-[210px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={THROUGHPUT}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2ac4f" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e2ac4f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4fc3ae" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4fc3ae" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1b2025" vertical={false} />
                <XAxis dataKey="week" stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} width={38} />
                <Tooltip contentStyle={TOOLTIP} />
                <Area type="monotone" dataKey="screened" stroke="#e2ac4f" strokeWidth={2} fill="url(#gA)" name="Screened" />
                <Area type="monotone" dataKey="shortlisted" stroke="#4fc3ae" strokeWidth={2} fill="url(#gB)" name="Shortlisted" />
                <Area type="monotone" dataKey="deployed" stroke="#93a0ab" strokeWidth={1.6} fill="transparent" name="Deployed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            {CONV.map((s) => (
              <div key={s.stage} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2">
                <p className="text-[10.5px] text-faint truncate">{s.stage}</p>
                <p className="text-[15px] font-semibold mt-0.5">{s.count.toLocaleString()}</p>
                <p className={`text-[10.5px] mt-0.5 ${s.conversion < 55 ? "text-danger" : "text-muted"}`}>
                  {s.stage === "Requirements" ? "entry" : `${s.conversion}% conv.`}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5" delay={0.12}>
          <SectionHead title="Client demand" sub="Open positions, week-over-week" right={<DemoTag />} />
          <div className="h-[210px] -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CLIENT_DEMAND} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke="#1b2025" horizontal={false} />
                <XAxis type="number" stroke="#63707b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="client" width={92} stroke="#63707b" fontSize={9.5} tickLine={false} axisLine={false}
                  tickFormatter={(v: string) => v.split(" ")[0]} />
                <Tooltip contentStyle={TOOLTIP} />
                <Bar dataKey="open" radius={[0, 5, 5, 0]} name="Open positions">
                  {CLIENT_DEMAND.map((c, i) => <Cell key={i} fill={c.wow > 20 ? "#e2ac4f" : "#3c4750"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {CLIENT_DEMAND.map((c) => (
              <div key={c.client} className="flex items-center justify-between text-[11.5px]">
                <span className="text-muted truncate">{c.client}</span>
                <span className={c.wow > 0 ? "text-ok" : "text-danger"}>{c.wow > 0 ? "+" : ""}{c.wow}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-3.5">
        <div className="lg:col-span-2">
          <SectionHead title="What needs my attention" sub="Prioritised by severity, owner and deadline" />
          <div className="space-y-2.5">
            {ATTENTION.map((a, i) => (
              <Card key={a.id} hover delay={0.05 * i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13.5px] font-medium">{a.title}</p>
                  <Badge tone={a.severity === "high" ? "danger" : a.severity === "medium" ? "warn" : "neutral"}>{a.severity}</Badge>
                </div>
                <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed">{a.detail}</p>
                <div className="mt-3 rounded-[10px] border border-line-soft bg-[rgba(226,172,79,0.045)] px-3 py-2">
                  <p className="label mb-1">Recommended action</p>
                  <p className="text-[12.5px] text-fg leading-relaxed">{a.recommendedAction}</p>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Badge>{a.owner}</Badge>
                  <Badge>{a.status}</Badge>
                  <Badge tone="warn">due {a.deadline}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <SectionHead title="AI Executive Brief" sub="Gemini reasoning over the seeded operating picture" right={<SourceTag source={brief?.source} note={brief?.note} />} />
          <Card className="p-5 min-h-[420px]" delay={0.1}>
            {!brief && !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="grid place-items-center w-12 h-12 rounded-2xl border border-line bg-surface-2 mb-4">
                  <Brain size={20} className="text-accent" />
                </motion.div>
                <p className="text-[14px] font-medium">Generate the executive brief</p>
                <p className="text-[12.5px] text-faint mt-1.5 max-w-md leading-relaxed">
                  Reads the funnel, client demand, market and strategy data, then returns what changed, why it matters,
                  the biggest risk and opportunity, and the three actions leadership should take today.
                </p>
                <button onClick={generate} className="btn btn-primary mt-5"><Sparkles size={14} /> Generate Brief</button>
              </div>
            )}

            {loading && (
              <div className="py-6">
                <AiThinking steps={["Reading operating data…", "Comparing week-over-week movement…", "Isolating the binding constraint…", "Weighing risks and opportunities…", "Selecting the top three actions…"]} />
              </div>
            )}

            {error && <ErrorNote message={error} />}

            {brief && <BriefView b={brief.data} onRegenerate={generate} />}
          </Card>
        </div>
      </div>
    </div>
  );
}

const TOOLTIP = {
  background: "#111417", border: "1px solid #22272c", borderRadius: 12,
  fontSize: 12, color: "#eef1f4", boxShadow: "0 18px 40px -22px rgba(0,0,0,.9)",
} as const;

function BriefView({ b, onRegenerate }: { b: ExecutiveBrief; onRegenerate: () => void }) {
  return (
    <div className="space-y-5 rise">
      <div className="grid sm:grid-cols-3 gap-2.5">
        {[["Business pulse", b.businessPulse], ["Recruitment pulse", b.recruitmentPulse], ["Client pulse", b.clientPulse]].map(([k, v]) => (
          <div key={k} className="rounded-[12px] border border-line-soft bg-surface px-3 py-3">
            <p className="label mb-1.5">{k}</p>
            <p className="text-[12px] text-muted leading-relaxed">{v}</p>
          </div>
        ))}
      </div>

      {b.whatChanged.length > 0 && (
        <div>
          <p className="label mb-2">What changed</p>
          <List items={b.whatChanged} />
        </div>
      )}

      {b.whyItMatters && (
        <div className="rounded-[12px] border border-line-soft bg-[rgba(79,195,174,0.05)] px-3.5 py-3">
          <p className="label mb-1.5">Why it matters</p>
          <div className="text-[12.5px] text-muted leading-relaxed prose-ai">{renderMarkdownish(b.whyItMatters)}</div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="label mb-2">Operational bottlenecks</p>
          <div className="space-y-2">
            {b.bottlenecks.map((x, i) => (
              <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                <p className="text-[12.5px] font-medium">{x.area}</p>
                <p className="text-[11.5px] text-muted mt-1 leading-relaxed">{x.detail}</p>
                <p className="text-[11px] text-warn mt-1">{x.impact}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-2">Strategic risks</p>
          <div className="space-y-2">
            {b.risks.map((x, i) => (
              <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px]">{x.risk}</p>
                  <Badge tone={x.severity === "high" ? "danger" : x.severity === "medium" ? "warn" : "neutral"}>{x.severity}</Badge>
                </div>
                <p className="text-[11.5px] text-muted mt-1 leading-relaxed">{x.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {b.opportunities.length > 0 && (
        <div>
          <p className="label mb-2">Opportunities</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {b.opportunities.map((o, i) => (
              <div key={i} className="rounded-[11px] border border-line-soft bg-surface px-3 py-2.5">
                <p className="text-[12.5px] font-medium">{o.opportunity}</p>
                <p className="text-[11.5px] text-muted mt-1">{o.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {b.decisionsRequired.length > 0 && (
        <div>
          <p className="label mb-2">Decisions required</p>
          <div className="space-y-1.5">
            {b.decisionsRequired.map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-[12.5px]">
                <ArrowRight size={13} className="text-accent shrink-0" />
                <span className="text-fg">{d.decision}</span>
                <span className="ml-auto text-[11px] text-faint whitespace-nowrap">{d.owner} · {d.by}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[13px] border border-[#4a3a1c] bg-[rgba(226,172,79,0.06)] p-4">
        <p className="label mb-2.5">Top 3 actions for leadership today</p>
        <div className="space-y-2.5">
          {b.topThreeActions.map((a, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[13px] font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[13px] text-fg">{a.action}</p>
                <p className="text-[11.5px] text-muted mt-0.5">{a.why}</p>
                <p className="text-[11px] text-faint mt-0.5">{a.owner} · {a.by}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10.5px] text-faint">Generated from illustrative prototype data · humans make the decisions</span>
        <button onClick={onRegenerate} className="btn btn-ghost !text-[12px]">Regenerate</button>
      </div>
    </div>
  );
}
