import { tokenize } from "@/lib/rag/embeddings";
import type { Candidate, HardGate, MatchResult, ScoreBreakdown } from "@/types";
import type { JobAnalysis } from "@/lib/ai/schema";

/**
 * Deterministic matching layer.
 *
 * The LLM is deliberately NOT trusted with the score. Retrieval proposes,
 * rules dispose: hard gates are checked explicitly and the final number is a
 * transparent weighted sum a recruiter can audit line by line. The reasoning
 * layer then explains and challenges this score — it never replaces it.
 */

export interface Weights {
  skills: number; experience: number; certification: number;
  marketFit: number; availability: number; language: number;
}

export const DEFAULT_WEIGHTS: Weights = {
  skills: 0.35, experience: 0.25, certification: 0.15,
  marketFit: 0.10, availability: 0.10, language: 0.05,
};

export const WEIGHT_LABELS: Record<keyof Weights, string> = {
  skills: "Skill match", experience: "Experience", certification: "Certification",
  marketFit: "Market suitability", availability: "Availability", language: "Language / other fit",
};

const GCC = ["saudi arabia","uae","united arab emirates","oman","kuwait","qatar","bahrain"];

/** Token-overlap similarity between a required skill and a candidate skill. */
function skillHit(required: string, have: string[]): number {
  const r = new Set(tokenize(required));
  if (!r.size) return 0;
  let best = 0;
  for (const h of have) {
    const t = new Set(tokenize(h));
    let inter = 0;
    for (const x of r) if (t.has(x)) inter++;
    best = Math.max(best, inter / r.size);
  }
  return best;
}

function scoreSkills(job: JobAnalysis, c: Candidate): { score: number; matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];
  let total = 0;
  const req = job.requiredSkills.length ? job.requiredSkills : [job.role];
  for (const s of req) {
    const h = skillHit(s, [...c.skills, c.role, c.summary]);
    total += h;
    (h >= 0.6 ? matched : missing).push(s);
  }
  let base = (total / req.length) * 100;
  // Preferred skills add a bounded bonus; they can never rescue a failed core match.
  if (job.preferredSkills.length) {
    const pref = job.preferredSkills.reduce((s, p) => s + skillHit(p, [...c.skills, c.summary, c.gccExperience ? "gcc experience" : ""]), 0) / job.preferredSkills.length;
    base = Math.min(100, base + pref * 8);
  }
  return { score: Math.round(base), matched, missing };
}

function scoreExperience(job: JobAnalysis, c: Candidate): number {
  const min = job.minYears || 1;
  if (c.years >= min * 1.5) return 100;
  if (c.years >= min) return Math.round(85 + ((c.years - min) / (min * 0.5)) * 15);
  return Math.round(Math.max(0, (c.years / min) * 70));
}

function scoreCertification(job: JobAnalysis, c: Candidate): { score: number; missing: string[] } {
  if (!job.certifications.length) return { score: 80, missing: [] };
  const missing: string[] = [];
  let hits = 0;
  for (const cert of job.certifications) {
    if (skillHit(cert, c.certifications) >= 0.5) hits++;
    else missing.push(cert);
  }
  return { score: Math.round((hits / job.certifications.length) * 100), missing };
}

function scoreMarketFit(job: JobAnalysis, c: Candidate): number {
  const market = job.market.toLowerCase();
  let s = 55;
  if (c.gccExperience) s += 25;
  if (market && c.location.toLowerCase().includes(market.split(",")[0])) s += 15;
  if (GCC.some((g) => c.location.toLowerCase().includes(g))) s += 8;
  if (c.languages.some((l) => /arabic/i.test(l))) s += 7;
  return Math.min(100, s);
}

const AVAIL: Record<Candidate["availability"], number> = {
  immediate: 100, "30_days": 85, "60_days": 65, engaged: 35,
};

function scoreLanguage(job: JobAnalysis, c: Candidate): number {
  const req = job.languages.length ? job.languages : ["English"];
  const hits = req.filter((l) => c.languages.some((cl) => cl.toLowerCase().includes(l.toLowerCase()))).length;
  return Math.round((hits / req.length) * 90 + (c.languages.length > 2 ? 10 : 0));
}

function gates(job: JobAnalysis, c: Candidate, certMissing: string[]): HardGate[] {
  const g: HardGate[] = [
    { label: "Minimum experience", passed: c.years >= job.minYears, detail: `${c.years} yrs vs ${job.minYears}+ required` },
    { label: "Mandatory certification", passed: certMissing.length === 0, detail: certMissing.length ? `Missing: ${certMissing.join(", ")}` : "All required certifications evidenced" },
    { label: "Passport validity", passed: c.passportValid, detail: c.passportValid ? "Valid travel document on file" : "Passport renewal in progress" },
    { label: "Medical clearance", passed: c.medicalCleared, detail: c.medicalCleared ? "Current" : "Pending — blocks mobilisation" },
    { label: "Availability in window", passed: c.availability !== "engaged", detail: c.availability.replace("_", " ") },
  ];
  return g;
}

export function scoreCandidate(job: JobAnalysis, c: Candidate, w: Weights = DEFAULT_WEIGHTS): MatchResult {
  const skills = scoreSkills(job, c);
  const cert = scoreCertification(job, c);
  const breakdown: ScoreBreakdown = {
    skills: skills.score,
    experience: scoreExperience(job, c),
    certification: cert.score,
    marketFit: scoreMarketFit(job, c),
    availability: AVAIL[c.availability],
    language: scoreLanguage(job, c),
  };
  const raw =
    breakdown.skills * w.skills +
    breakdown.experience * w.experience +
    breakdown.certification * w.certification +
    breakdown.marketFit * w.marketFit +
    breakdown.availability * w.availability +
    breakdown.language * w.language;

  const hardGates = gates(job, c, cert.missing);
  const blocking = hardGates.filter((g) => !g.passed);
  // A failed gate is never hidden inside an average — it caps the score.
  const capped = blocking.length ? Math.min(raw, 74 - (blocking.length - 1) * 8) : raw;

  const evidence = [
    `${c.years} years as ${c.role} (${c.sector}).`,
    skills.matched.length ? `Evidenced required skills: ${skills.matched.join(", ")}.` : "No required skill evidenced directly in profile.",
    c.certifications.length ? `Certifications on file: ${c.certifications.join(", ")}.` : "No certifications on file.",
    c.gccExperience ? "Prior GCC deployment recorded." : "No prior GCC deployment recorded.",
  ];

  const gaps = [
    ...skills.missing.map((s) => `Missing or unevidenced skill: ${s}`),
    ...cert.missing.map((s) => `Certification not evidenced: ${s}`),
    ...blocking.filter((g) => g.label !== "Mandatory certification").map((g) => `${g.label}: ${g.detail}`),
  ];

  return {
    candidate: c,
    deterministicScore: Math.round(capped),
    breakdown,
    gates: hardGates,
    eligible: blocking.length === 0,
    evidence,
    gaps,
  };
}

export function rank(job: JobAnalysis, candidates: Candidate[], w?: Weights): MatchResult[] {
  return candidates.map((c) => scoreCandidate(job, c, w)).sort((a, b) => b.deterministicScore - a.deterministicScore);
}
