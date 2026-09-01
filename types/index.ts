export type Availability = "immediate" | "30_days" | "60_days" | "engaged";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  sector: Sector;
  years: number;
  location: string;
  nationality: string;
  skills: string[];
  certifications: string[];
  languages: string[];
  availability: Availability;
  gccExperience: boolean;
  passportValid: boolean;
  medicalCleared: boolean;
  summary: string;
  expectedSalaryUsd: number;
}

export type Sector =
  | "Mechanical" | "Electrical" | "Welding" | "Construction"
  | "Healthcare" | "Hospitality" | "IT";

export interface JobRequirement {
  id: string;
  title: string;
  client: string;
  market: Market;
  sector: Sector;
  minYears: number;
  requiredSkills: string[];
  preferredSkills: string[];
  certifications: string[];
  languages: string[];
  headcount: number;
  startWindowDays: number;
  status: "open" | "sourcing" | "shortlisting" | "documentation" | "deployed";
  raw?: string;
}

export type Market =
  | "Saudi Arabia" | "UAE" | "Oman" | "Kuwait" | "Qatar" | "Bahrain";

/** Deterministic, auditable score breakdown. Never derived from an LLM. */
export interface ScoreBreakdown {
  skills: number;
  experience: number;
  certification: number;
  marketFit: number;
  availability: number;
  language: number;
}

export interface HardGate {
  label: string;
  passed: boolean;
  detail: string;
}

export interface MatchResult {
  candidate: Candidate;
  deterministicScore: number;
  breakdown: ScoreBreakdown;
  gates: HardGate[];
  eligible: boolean;
  evidence: string[];
  gaps: string[];
  /** Populated only when the reasoning layer ran. */
  ai?: AiMatchVerdict;
}

export interface AiMatchVerdict {
  overallScore: number;
  confidence: number;
  strengths: string[];
  gaps: string[];
  risks: string[];
  recommendation: string;
  evidence: string[];
  trainingRecommendations: string[];
  interviewQuestions: string[];
  source: "gemini" | "demo";
}

export interface RetrievedChunk {
  docId: string;
  docTitle: string;
  section: string;
  text: string;
  score: number;
}

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  owner: string;
  status: string;
  recommendedAction: string;
  deadline: string;
}

export interface Priority {
  id: string;
  index: string;
  title: string;
  owner: string;
  status: "On track" | "In progress" | "At risk";
  progress: number;
  objective: string;
  milestones: { label: string; done: boolean }[];
  dependencies: string[];
  kpis: string[];
  risks: string[];
  nextDecision: string;
}

export interface Decision {
  id: string;
  decision: string;
  context: string;
  owner: string;
  date: string;
  status: "Under review" | "Approved" | "Deferred" | "Rejected";
  impact: "High" | "Medium" | "Low";
}

export interface ActionItem {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  priority: "P0" | "P1" | "P2";
  status: "backlog" | "in_progress" | "blocked" | "done";
}

export interface MarketRow {
  market: Market;
  demandIndex: number;
  candidateSupply: number;
  skillGap: number;
  pipeline: number;
  opportunityScore: number;
  note: string;
}

export interface FunnelStage { stage: string; count: number; avgDays: number; }
