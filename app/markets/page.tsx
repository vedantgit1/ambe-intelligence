"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge, Bar, Card, DemoTag, PageHead, SectionHead } from "@/components/ui/primitives";
import { MARKETS } from "@/lib/data/business";

export default function MarketsPage() {
  const radar = MARKETS.map((m) => ({ market: m.market.split(" ")[0], demand: m.demandIndex, supply: m.candidateSupply }));
  return (
    <div>
      <PageHead title="Market Intelligence" sub="Where demand, supply and readiness meet across the GCC."
        right={<Badge tone="warn">Illustrative prototype data — not real-world market data</Badge>} />

      <div className="grid lg:grid-cols-3 gap-3.5 mb-3.5">
        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Opportunity ranking" sub="Opportunity score blends demand, supply coverage and pipeline depth" right={<DemoTag />} />
          <div className="space-y-3.5">
            {[...MARKETS].sort((a, b) => b.opportunityScore - a.opportunityScore).map((m, i) => (
              <div key={m.market}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[13.5px] font-medium">{m.market}</span>
                  </div>
                  <span className={`text-[16px] font-semibold ${m.opportunityScore >= 84 ? "text-accent" : "text-muted"}`}>{m.opportunityScore}</span>
                </div>
                <Bar value={m.opportunityScore} tone={m.opportunityScore >= 84 ? "accent" : "teal"} />
                <p className="text-[11.5px] text-faint mt-1.5">{m.note}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead title="Demand vs supply" sub="Index, 0–100" right={<DemoTag />} />
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="#22272c" />
                <PolarAngleAxis dataKey="market" tick={{ fill: "#93a0ab", fontSize: 10.5 }} />
                <Tooltip contentStyle={{ background: "#111417", border: "1px solid #22272c", borderRadius: 12, fontSize: 12 }} />
                <Radar name="Demand" dataKey="demand" stroke="#e2ac4f" fill="#e2ac4f" fillOpacity={0.22} />
                <Radar name="Supply" dataKey="supply" stroke="#4fc3ae" fill="#4fc3ae" fillOpacity={0.14} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-[12.5px] min-w-[760px]">
            <thead>
              <tr className="text-faint border-b border-line-soft">
                {["Market", "Demand index", "Candidate supply", "Skill gap", "Pipeline", "Opportunity score"].map((h) => (
                  <th key={h} className="text-left font-normal px-4 py-3 text-[11px] tracking-wide uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MARKETS.map((m) => (
                <tr key={m.market} className="border-b border-line-soft last:border-0 hover:bg-surface-2/60 transition-colors">
                  <td className="px-4 py-3.5 font-medium">{m.market}</td>
                  <td className="px-4 py-3.5"><InlineBar v={m.demandIndex} tone="accent" /></td>
                  <td className="px-4 py-3.5"><InlineBar v={m.candidateSupply} tone="teal" /></td>
                  <td className="px-4 py-3.5"><Badge tone={m.skillGap > 30 ? "danger" : m.skillGap > 24 ? "warn" : "neutral"}>{m.skillGap}%</Badge></td>
                  <td className="px-4 py-3.5 text-muted">{m.pipeline.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-accent">{m.opportunityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] text-faint mt-4 max-w-3xl leading-relaxed">
        All market figures on this page are fictional values created for this prototype. They are not Ambe International
        data, and they are not sourced from any external market research.
      </p>
    </div>
  );
}

function InlineBar({ v, tone }: { v: number; tone: "accent" | "teal" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20"><Bar value={v} tone={tone} height={5} /></div>
      <span className="text-muted text-[11.5px]">{v}</span>
    </div>
  );
}
