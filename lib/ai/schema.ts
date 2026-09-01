import { z } from "zod";

/** Every model response crosses this boundary before the UI can render it. */

const str = z.string();
const strArr = z.array(z.string()).default([]);
const pct = z.coerce.number().min(0).max(100);

export const JobAnalysisSchema = z.object({
  role: str,
  seniority: str.default(""),
  sector: z.enum(["Mechanical","Electrical","Welding","Construction","Healthcare","Hospitality","IT"]).catch("Mechanical"),
  market: str.default(""),
  minYears: z.coerce.number().min(0).max(50).default(0),
  requiredSkills: strArr,
  preferredSkills: strArr,
  certifications: strArr,
  languages: strArr,
  constraints: strArr,
  niceToHave: strArr,
  searchQuery: str.default(""),
  notes: str.default(""),
});
export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

export const MatchVerdictSchema = z.object({
  overallScore: pct,
  confidence: pct,
  strengths: strArr,
  gaps: strArr,
  risks: strArr,
  recommendation: str,
  evidence: strArr,
  trainingRecommendations: strArr,
  interviewQuestions: strArr,
});
export type MatchVerdict = z.infer<typeof MatchVerdictSchema>;

export const SkillGapSchema = z.object({
  headline: str,
  highestDemandSkills: z.array(z.object({ skill: str, why: str })).default([]),
  shortages: z.array(z.object({ trade: str, gap: z.coerce.number(), implication: str })).default([]),
  recommendedTraining: z.array(z.object({ program: str, cohortSize: str, durationWeeks: z.coerce.number(), rationale: str })).default([]),
  expectedImpact: z.object({ placements: str, timeToDeployWeeks: str, conversionUplift: str }),
  risks: strArr,
  next7Days: strArr,
});
export type SkillGapAnalysis = z.infer<typeof SkillGapSchema>;

export const BriefSchema = z.object({
  asOf: str.default(""),
  businessPulse: str,
  recruitmentPulse: str,
  clientPulse: str,
  whatChanged: strArr,
  whyItMatters: str,
  bottlenecks: z.array(z.object({ area: str, detail: str, impact: str })).default([]),
  risks: z.array(z.object({ risk: str, severity: z.enum(["high","medium","low"]).catch("medium"), mitigation: str })).default([]),
  opportunities: z.array(z.object({ opportunity: str, value: str })).default([]),
  decisionsRequired: z.array(z.object({ decision: str, owner: str, by: str })).default([]),
  topThreeActions: z.array(z.object({ action: str, owner: str, by: str, why: str })).default([]),
});
export type ExecutiveBrief = z.infer<typeof BriefSchema>;

export const StrategyPlanSchema = z.object({
  objective: str,
  initiatives: z.array(z.object({ name: str, outcome: str })).default([]),
  sequencing: z.array(z.object({ phase: str, weeks: str, focus: str })).default([]),
  ownerRecommendations: z.array(z.object({ workstream: str, owner: str, why: str })).default([]),
  dependencies: strArr,
  kpis: z.array(z.object({ kpi: str, target: str, cadence: str })).default([]),
  risks: z.array(z.object({ risk: str, mitigation: str })).default([]),
  next7Days: z.array(z.object({ action: str, owner: str, by: str })).default([]),
});
export type StrategyPlan = z.infer<typeof StrategyPlanSchema>;

export const DecisionSupportSchema = z.object({
  context: str,
  options: z.array(z.object({ option: str, pros: strArr, cons: strArr })).default([]),
  risks: strArr,
  recommendation: str,
  confidence: pct.default(60),
  reversibility: z.enum(["one-way","two-way"]).catch("two-way"),
  whatWouldChangeMyMind: strArr,
});
export type DecisionSupport = z.infer<typeof DecisionSupportSchema>;

export const DiagnosisSchema = z.object({
  bottleneck: str,
  evidence: strArr,
  likelyCauses: z.array(z.object({ cause: str, confidence: z.enum(["high","medium","low"]).catch("medium") })).default([]),
  interventions: z.array(z.object({ intervention: str, effort: z.enum(["low","medium","high"]).catch("medium"), expectedImpact: str, owner: str })).default([]),
  leadingIndicators: strArr,
  ifIgnored: str,
});
export type Diagnosis = z.infer<typeof DiagnosisSchema>;

export const CopilotSchema = z.object({
  answer: str,
  keyPoints: strArr,
  recommendedActions: z.array(z.object({ action: str, owner: str, by: str })).default([]),
  confidence: pct.default(60),
  usedRetrieval: z.boolean().default(false),
});
export type CopilotAnswer = z.infer<typeof CopilotSchema>;

export const CvProfileSchema = z.object({
  name: str.default("Unnamed candidate"),
  role: str.default(""),
  sector: z.enum(["Mechanical","Electrical","Welding","Construction","Healthcare","Hospitality","IT"]).catch("Mechanical"),
  years: z.coerce.number().min(0).max(60).default(0),
  location: str.default(""),
  skills: strArr,
  certifications: strArr,
  languages: strArr,
  education: strArr,
  availability: z.enum(["immediate","30_days","60_days","engaged"]).catch("immediate"),
  summary: str.default(""),
  extractionNotes: strArr,
});
export type CvProfile = z.infer<typeof CvProfileSchema>;

/** Turns a zod schema into the validator shape generateJson expects. */
export const validator =
  <T extends z.ZodTypeAny>(schema: T) =>
  (raw: unknown): z.infer<T> => {
    const r = schema.safeParse(raw);
    if (!r.success) throw new Error(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ").slice(0, 400));
    return r.data;
  };
