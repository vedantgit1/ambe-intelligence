import {
  ACTIONS, ATTENTION, CLIENT_DEMAND, DECISIONS, FUNNEL, KPIS,
  MARKETS, PRIORITIES, REQUIREMENTS, RECRUITER_PRODUCTIVITY,
  SKILL_PIPELINE, THROUGHPUT,
} from "@/lib/data/business";

/** Stage-to-stage conversion, computed — not hard-coded. */
export function funnelConversions() {
  return FUNNEL.map((s, i) => {
    const prev = i === 0 ? null : FUNNEL[i - 1];
    const rate = prev ? (s.count / prev.count) * 100 : 100;
    return { ...s, conversion: Math.round(rate * 10) / 10, drop: prev ? prev.count - s.count : 0 };
  });
}

/** The largest conversion loss after the top-of-funnel. Drives the anomaly banner. */
export function biggestBottleneck() {
  const rows = funnelConversions().slice(2);
  return rows.reduce((worst, r) => (r.conversion < worst.conversion ? r : worst), rows[0]);
}

export function slowestStage() {
  return FUNNEL.reduce((a, b) => (b.avgDays > a.avgDays ? b : a));
}

/**
 * The single context object every executive-facing prompt is grounded in.
 * Keeping it in one place means the model, the UI and the README all describe
 * the same business — and keeps prompt payloads small and stable (cache-friendly).
 */
export function businessContext(): string {
  const conv = funnelConversions();
  const bn = biggestBottleneck();
  return JSON.stringify(
    {
      note: "Illustrative prototype data for a fictional workforce-mobility operation.",
      asOf: new Date().toISOString().slice(0, 10),
      kpis: KPIS.map((k) => ({ metric: k.label, value: k.value, delta: k.delta })),
      weeklyThroughput: THROUGHPUT,
      funnel: conv.map((c) => ({ stage: c.stage, count: c.count, conversionFromPrevPct: c.conversion, avgDaysInStage: c.avgDays })),
      largestConversionLoss: { stage: bn.stage, conversionPct: bn.conversion, avgDays: bn.avgDays },
      slowestStage: slowestStage(),
      clientDemandWoW: CLIENT_DEMAND,
      markets: MARKETS.map((m) => ({ market: m.market, demandIndex: m.demandIndex, supply: m.candidateSupply, skillGapPct: m.skillGap, opportunityScore: m.opportunityScore })),
      recruiterProductivity: RECRUITER_PRODUCTIVITY,
      openRequirements: REQUIREMENTS.map((r) => ({ id: r.id, title: r.title, client: r.client, market: r.market, headcount: r.headcount, status: r.status, startWindowDays: r.startWindowDays })),
      attentionItems: ATTENTION.map((a) => ({ title: a.title, severity: a.severity, owner: a.owner, detail: a.detail })),
      strategicPriorities: PRIORITIES.map((p) => ({ title: p.title, owner: p.owner, status: p.status, progressPct: p.progress, nextDecision: p.nextDecision })),
      openDecisions: DECISIONS.filter((d) => d.status === "Under review").map((d) => ({ decision: d.decision, owner: d.owner, impact: d.impact })),
      openActions: ACTIONS.filter((a) => a.status !== "done").map((a) => ({ title: a.title, owner: a.owner, status: a.status, priority: a.priority, deadline: a.deadline })),
      skillPipeline: SKILL_PIPELINE,
    },
    null,
    0,
  );
}

export function skillContext(): string {
  return JSON.stringify(
    {
      note: "Illustrative prototype data.",
      focusTrade: SKILL_PIPELINE.trade,
      pipeline: SKILL_PIPELINE.stages,
      demandVsSupplyByTrade: SKILL_PIPELINE.trades,
      marketSkillGaps: MARKETS.map((m) => ({ market: m.market, skillGapPct: m.skillGap, demandIndex: m.demandIndex })),
      openRequirementsBySector: REQUIREMENTS.reduce<Record<string, number>>((acc, r) => {
        acc[r.sector] = (acc[r.sector] ?? 0) + r.headcount;
        return acc;
      }, {}),
      planningAssumptions: { assessmentAttemptRate: 0.9, certificationPassRate: 0.87, targetDeploymentRate: "85-90%" },
    },
    null,
    0,
  );
}
