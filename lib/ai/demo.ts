import { biggestBottleneck, funnelConversions, slowestStage } from "@/lib/analytics/metrics";
import { CLIENT_DEMAND, KPIS, MARKETS, SKILL_PIPELINE } from "@/lib/data/business";
import type {
  CopilotAnswer, DecisionSupport, Diagnosis, ExecutiveBrief,
  JobAnalysis, MatchVerdict, SkillGapAnalysis, StrategyPlan,
} from "@/lib/ai/schema";
import type { MatchResult } from "@/types";

/**
 * Demo-intelligence fallbacks.
 *
 * These are NOT pretend AI. They are deterministic analyses computed from the
 * same seeded data, used only when Gemini is unconfigured or unreachable, and
 * they are always labelled "Demo intelligence" in the UI. When a key is
 * present, the real model runs and these never execute.
 */

export const demoJobAnalysis = (raw: string): JobAnalysis => {
  const l = raw.toLowerCase();
  const pick = (opts: string[]) => opts.filter((o) => l.includes(o.toLowerCase()));
  const skills = pick(["Mechanical maintenance","Preventive maintenance","Industrial equipment","Troubleshooting","Electrical maintenance","6G welding","Critical care","Scaffolding erection","HVAC maintenance","Instrumentation"]);
  const yearsMatch = l.match(/(\d+)\s*\+?\s*year/);
  const market = ["Saudi Arabia","UAE","Oman","Kuwait","Qatar","Bahrain"].find((m) => l.includes(m.toLowerCase())) ?? "Saudi Arabia";
  const titleLine = raw.split("\n").map((s) => s.trim()).find((s) => s && !/^(position|country|experience|required|preferred)/i.test(s)) ?? "Senior Mechanical Technician";
  // Only text BEFORE a "preferred/nice to have" heading can create a hard gate.
  // Treating a preferred certification as mandatory fails every candidate.
  const requiredBlock = raw.split(/preferred|nice[- ]to[- ]have|desirable/i)[0];
  const preferredBlock = raw.slice(requiredBlock.length);
  return {
    role: titleLine.slice(0, 60),
    seniority: /senior|lead|supervisor/i.test(raw) ? "Senior" : "Mid-level",
    sector: /weld/i.test(raw) ? "Welding" : /nurse|clinical|icu/i.test(raw) ? "Healthcare" : /electric|instrument/i.test(raw) ? "Electrical" : /scaffold|civil|crane/i.test(raw) ? "Construction" : "Mechanical",
    market,
    minYears: yearsMatch ? Number(yearsMatch[1]) : 5,
    requiredSkills: skills.length ? skills : ["Mechanical maintenance","Preventive maintenance","Industrial equipment","Troubleshooting"],
    preferredSkills: [
      ...(/gcc/i.test(preferredBlock) ? ["GCC experience"] : []),
      ...(/certif/i.test(preferredBlock) ? ["Relevant trade certification"] : []),
    ],
    certifications: /certif|licen[cs]e|nsqf|asme|nebosh/i.test(requiredBlock) ? ["Relevant trade certification"] : [],
    languages: ["English"],
    constraints: [`Minimum ${yearsMatch ? yearsMatch[1] : 5} years relevant experience`, `${market} market eligibility`, "Deployment-ready documentation"],
    niceToHave: ["GCC experience", "Trade certification"],
    searchQuery: raw.replace(/\s+/g, " ").slice(0, 400),
    notes: "Demo intelligence: extracted with deterministic rules because Gemini is not configured.",
  };
};

export const demoMatchVerdict = (m: MatchResult): MatchVerdict => ({
  overallScore: m.deterministicScore,
  confidence: m.eligible ? 78 : 62,
  strengths: [
    `${m.candidate.years} years as ${m.candidate.role}`,
    m.candidate.gccExperience ? "Prior GCC deployment reduces onboarding risk" : "Domestic experience base with transferable trade skills",
    `Skill sub-score ${m.breakdown.skills}% against the required set`,
  ],
  gaps: m.gaps.length ? m.gaps.slice(0, 3) : ["No material gap detected against the stated requirement"],
  risks: m.eligible ? ["Availability could shift before mobilisation"] : m.gates.filter((g) => !g.passed).map((g) => `${g.label}: ${g.detail}`),
  recommendation: m.eligible
    ? `Recommend shortlisting. Deterministic score ${m.deterministicScore}% with all hard gates cleared.`
    : `Hold pending gate clearance. Primary blocker is ${m.gates.find((g) => !g.passed)?.label.toLowerCase()} rather than technical capability.`,
  evidence: m.evidence,
  trainingRecommendations: m.gaps.slice(0, 2).map((g) => `Close via short module: ${g.replace(/^[^:]+: /, "")}`),
  interviewQuestions: [
    `Walk me through the most complex ${m.candidate.sector.toLowerCase()} fault you diagnosed and how you isolated it.`,
    "Describe your preventive maintenance routine and how you evidence completion.",
    "How do you handle a safety permit dispute on site?",
  ],
});

export const demoBrief = (): ExecutiveBrief => {
  const bn = biggestBottleneck();
  const slow = slowestStage();
  const spike = CLIENT_DEMAND.reduce((a, b) => (b.wow > a.wow ? b : a));
  return {
    asOf: new Date().toISOString().slice(0, 10),
    businessPulse: `Throughput is holding at ${KPIS[0].value} active requirements and ${KPIS[1].value.toLocaleString()} candidates in pipeline, but placements are down (${KPIS[2].delta}) against a target of 145. The constraint is downstream of sourcing.`,
    recruitmentPulse: `Screening volume rose week-over-week while deployments fell — the funnel is converting worse, not filling worse. ${bn.stage} shows the weakest stage conversion at ${bn.conversion}%.`,
    clientPulse: `${spike.client} demand moved ${spike.wow > 0 ? "+" : ""}${spike.wow}% week-over-week, the largest client-side swing in the dataset.`,
    whatChanged: [
      `${spike.client} requirements ${spike.wow > 0 ? "up" : "down"} ${Math.abs(spike.wow)}% WoW`,
      `${slow.stage} dwell time at ${slow.avgDays} days, the slowest stage in the chain`,
      "At-risk projects up from 3 to 5",
    ],
    whyItMatters: "Sourcing capacity is not the binding constraint; calendar-bound processing stages are. Adding recruiters would not move this month's placement number — clearing documentation would.",
    bottlenecks: [
      { area: bn.stage, detail: `Stage conversion ${bn.conversion}% with ${bn.avgDays} days average dwell.`, impact: "Directly suppresses the monthly placement figure." },
      { area: "Certification capacity", detail: "Welding and refrigeration assessment slots constrain next month's cohort.", impact: "Est. 60-80 placements at risk next cycle." },
    ],
    risks: [
      { risk: "Committed start window slips on the Kuwait scaffolding batch", severity: "high", mitigation: "Split the batch and mobilise cleared candidates on the original date." },
      { risk: "Healthcare demand outruns the licensed supply pool", severity: "medium", mitigation: "Open a second sourcing corridor now, before the licensing lead time bites." },
    ],
    opportunities: [
      { opportunity: "Healthcare demand spike", value: `${spike.wow}% WoW growth with the highest margin per placement in the mix.` },
      { opportunity: "AI-assisted screening rollout", value: "Recovers recruiter hours in the team carrying 38% above-average load." },
    ],
    decisionsRequired: [
      { decision: "Approve a dedicated document verification cell", owner: "Operations", by: "in 3 days" },
      { decision: "Commit to a second welding training partner", owner: "Strategic Initiatives", by: "in 10 days" },
    ],
    topThreeActions: [
      { action: "Stand up a document verification cell and pre-stage attestation at shortlist", owner: "Operations", by: "in 3 days", why: "It is the largest single conversion loss in the funnel." },
      { action: "Open a second healthcare sourcing corridor", owner: "Business Development", by: "in 5 days", why: "Licensing lead time is 60-75 days; the decision must precede the demand." },
      { action: "Pre-book assessment capacity for welding cohorts", owner: "Strategic Initiatives", by: "in 10 days", why: "Cheapest intervention that protects next cycle's deployment plan." },
    ],
  };
};

export const demoSkillGap = (): SkillGapAnalysis => ({
  headline: `${SKILL_PIPELINE.trade}: demand of ${SKILL_PIPELINE.marketDemand} against a qualified pool of ${SKILL_PIPELINE.qualifiedPool} leaves a gap of ${SKILL_PIPELINE.gap}.`,
  highestDemandSkills: [
    { skill: "6G pipe welding", why: "Hard-gated by client weld tests; structural welders are not substitutable." },
    { skill: "Licensed critical-care nursing", why: "Healthcare demand is growing fastest and licensing is the long pole." },
    { skill: "Industrial preventive maintenance", why: "Recurring, multi-client demand with the most stable order book." },
  ],
  shortages: SKILL_PIPELINE.trades.filter((t) => t.gap > 70).map((t) => ({ trade: t.trade, gap: t.gap, implication: `Cannot be filled from the standing pool; requires trained intake or corridor expansion.` })),
  recommendedTraining: [
    { program: "6G welding upskilling for qualified structural welders", cohortSize: SKILL_PIPELINE.recommendedTrainingCapacity, durationWeeks: 8, rationale: "Shortest path from an existing qualified pool to the highest-gap trade." },
    { program: "Industrial maintenance NSQF Level 5 bridge", cohortSize: "80-100", durationWeeks: 6, rationale: "Converts domestic-experience technicians into GCC-deployable profiles." },
  ],
  expectedImpact: { placements: "~126 deployed from a 190-trainee intake", timeToDeployWeeks: "14-18", conversionUplift: "Certified-to-placed conversion moves from ~66% to ~85%" },
  risks: ["Assessment capacity is the binding constraint, not training capacity", "Demand may shift trade mix before cohorts complete", "Single-partner dependency on the welding pathway"],
  next7Days: ["Confirm assessment slot availability with both partners", "Lock the demand forecast used for cohort sizing", "Draft the MoU for the second training partner"],
});

export const demoStrategy = (priorityTitle: string): StrategyPlan => ({
  objective: `Convert "${priorityTitle}" into a measurable 90-day execution plan with named owners and weekly checkpoints.`,
  initiatives: [
    { name: "Baseline and instrument", outcome: "A single agreed metric definition and a weekly reporting cadence." },
    { name: "Unblock the binding constraint", outcome: "The one stage limiting throughput is resourced and measured separately." },
    { name: "Scale what works", outcome: "Proven intervention extended to the next two teams or corridors." },
  ],
  sequencing: [
    { phase: "Phase 1 — Baseline", weeks: "Weeks 1-2", focus: "Instrument the funnel, agree definitions, publish the first weekly view." },
    { phase: "Phase 2 — Unblock", weeks: "Weeks 3-6", focus: "Attack the constraint with a dedicated owner and a daily standup." },
    { phase: "Phase 3 — Scale", weeks: "Weeks 7-12", focus: "Extend, automate, and hand over to the line owner." },
  ],
  ownerRecommendations: [
    { workstream: "Measurement", owner: "Chief of Staff", why: "Neutral across functions; owns the leadership cadence." },
    { workstream: "Operational unblocking", owner: "Operations", why: "Controls the calendar-bound stages where the loss occurs." },
    { workstream: "Tooling", owner: "AI Transformation", why: "Owns the retrieval and matching layer the workflow depends on." },
  ],
  dependencies: ["Clean, consistent candidate data", "Client demand forecast accuracy", "Training and assessment partner capacity", "Recruiter change management"],
  kpis: [
    { kpi: "Time-to-fill", target: "-15% in 90 days", cadence: "Weekly" },
    { kpi: "Stage conversion at the constraint", target: "+10 points", cadence: "Weekly" },
    { kpi: "Screening hours per requirement", target: "-40%", cadence: "Fortnightly" },
  ],
  risks: [
    { risk: "Effort spreads across all stages instead of the constraint", mitigation: "Publish the constraint weekly; fund only that workstream until it moves." },
    { risk: "Metric definitions drift between market teams", mitigation: "One owner for the definition, versioned and dated." },
  ],
  next7Days: [
    { action: "Publish the baseline funnel view to leadership", owner: "Chief of Staff", by: "in 3 days" },
    { action: "Name a single accountable owner for the constraint", owner: "Operations", by: "in 2 days" },
    { action: "Agree the KPI definitions in writing", owner: "AI Transformation", by: "in 5 days" },
  ],
});

export const demoDecision = (decision: string): DecisionSupport => ({
  context: `"${decision}" — evaluated against the current operating picture, where the funnel constraint sits in calendar-bound processing rather than sourcing.`,
  options: [
    { option: "Commit now at limited scale", pros: ["Fastest learning", "Bounded downside", "Preserves optionality"], cons: ["Slower absolute impact", "Coordination overhead"] },
    { option: "Commit fully", pros: ["Maximum impact if the thesis holds", "Clear organisational signal"], cons: ["Harder to reverse", "Concentrates risk on one assumption"] },
    { option: "Defer one cycle", pros: ["More evidence", "No spend now"], cons: ["Lead times mean the window may close", "Constraint persists meanwhile"] },
  ],
  risks: ["The demand signal driving the decision is one week of data", "Downstream capacity may not absorb the upside", "Deferring costs a full lead-time cycle"],
  recommendation: "Commit now at limited scale with an explicit 30-day review gate. The lead times in this business are long enough that deferral is itself a decision.",
  confidence: 72,
  reversibility: "two-way",
  whatWouldChangeMyMind: ["Two more weeks of flat demand", "Evidence that processing capacity cannot absorb the added volume"],
});

export const demoDiagnosis = (): Diagnosis => {
  const bn = biggestBottleneck();
  const conv = funnelConversions();
  return {
    bottleneck: `${bn.stage} — ${bn.conversion}% stage conversion, ${bn.avgDays} days average dwell.`,
    evidence: [
      `${bn.stage} converts at ${bn.conversion}% versus a funnel median of ${Math.round(conv.slice(1).reduce((s, c) => s + c.conversion, 0) / (conv.length - 1))}%.`,
      `Dwell time at this stage is ${bn.avgDays} days against a 9-day target.`,
      "Screening volume rose while deployments fell, which excludes top-of-funnel supply as the cause.",
    ],
    likelyCauses: [
      { cause: "Attestation queues at source with no pre-staging at shortlist", confidence: "high" },
      { cause: "Incomplete certificate sets accepted at offer stage", confidence: "high" },
      { cause: "Batch processing instead of first-in-first-out handling", confidence: "medium" },
    ],
    interventions: [
      { intervention: "Pre-stage attestation at shortlist rather than post-offer", effort: "medium", expectedImpact: "Historically ~1/3 reduction in stage dwell", owner: "Operations" },
      { intervention: "Hard document checklist gate before an offer is issued", effort: "low", expectedImpact: "Removes rework loops at verification", owner: "Mobilisation" },
      { intervention: "Dedicated verification cell with daily WIP limits", effort: "medium", expectedImpact: "Predictable throughput, visible queue", owner: "Operations" },
    ],
    leadingIndicators: ["Documents-complete-at-offer rate", "Verification queue depth", "Median days from offer to document-complete"],
    ifIgnored: "Placements continue to decline while sourcing spend rises, and committed client start windows slip — the most expensive failure mode in this business.",
  };
};

export const demoCopilot = (question: string): CopilotAnswer => {
  const bn = biggestBottleneck();
  const top = MARKETS[0];
  return {
    answer: `**Demo intelligence** (Gemini not configured — this answer is computed from the seeded operating data).\n\nThe operating picture is dominated by one fact: **${bn.stage} converts at ${bn.conversion}%** with ${bn.avgDays} days of dwell, while screening volume is up week-over-week. Supply is not the constraint; processing is.\n\nThe second fact is demand-side: healthcare requirements moved +31% WoW, and **${top.market}** carries the highest opportunity score (${top.opportunityScore}) in the market set.\n\nLeadership attention this week should go to clearing the processing constraint and pre-positioning healthcare supply, in that order.`,
    keyPoints: [
      `${bn.stage} is the largest conversion loss in the funnel`,
      "Healthcare demand is growing faster than licensed supply",
      "Placements are down despite higher screening volume",
    ],
    recommendedActions: [
      { action: "Stand up a dedicated document verification cell", owner: "Operations", by: "in 3 days" },
      { action: "Open a second healthcare sourcing corridor", owner: "Business Development", by: "in 5 days" },
    ],
    confidence: 65,
    usedRetrieval: false,
  };
};
