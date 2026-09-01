"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Scale, Search, ShieldCheck, Sparkles, Star, UserRound, X } from "lucide-react";
import {
  AiThinking, Badge, Bar, Card, DemoTag, Empty, ErrorNote, List, PageHead, SectionHead, SourceTag,
} from "@/components/ui/primitives";
import { WEIGHT_LABELS, DEFAULT_WEIGHTS } from "@/lib/matching/engine";
import type { JobAnalysis, MatchVerdict } from "@/lib/ai/schema";
import type { MatchResult } from "@/types";

const EXAMPLE = `POSITION: Senior Mechanical Technician
COUNTRY: Saudi Arabia
EXPERIENCE: 5+ years

REQUIRED SKILLS:
- Mechanical maintenance
- Industrial equipment
- Preventive maintenance
- Troubleshooting

PREFERRED:
- GCC experience
- Relevant certification`;

type Ranked = MatchResult & { retrievalScore: number };

export default function TalentPage() {
  const [raw, setRaw] = useState(EXAMPLE);
  const [analysis, setAnalysis] = useState<{ data: JobAnalysis; source: "gemini" | "demo"; note?: string } | null>(null);
  const [matches, setMatches] = useState<Ranked[] | null>(null);
  const [retrieval, setRetrieval] = useState<{ mode: string; returned: number; widened: boolean } | null>(null);
  const [phase, setPhase] = useState<"idle" | "analyzing" | "matching">("idle");
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Ranked | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("run") === "analyze") run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    setError(""); setMatches(null); setAnalysis(null); setPhase("analyzing");
    try {
      const r1 = await fetch("/api/analyze-job", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw }) });
      const j1 = await r1.json();
      if (!r1.ok) throw new Error(j1.error ?? "Analysis failed");
      setAnalysis(j1);
      setPhase("matching");
      const r2 = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysis: j1.data }) });
      const j2 = await r2.json();
      if (!r2.ok) throw new Error(j2.error ?? "Matching failed");
      setMatches(j2.results); setRetrieval(j2.retrieval);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setPhase("idle"); }
  }

  return (
    <div>
      <PageHead
        title="AI Talent Match"
        sub="Find the strongest candidates for every requirement."
        right={<Badge tone="teal"><ShieldCheck size={11} /> AI reasoning + deterministic criteria</Badge>}
      />

      <div className="grid lg:grid-cols-5 gap-3.5">
        <div className="lg:col-span-2 space-y-3.5">
          <Card className="p-5">
            <SectionHead title="Job requirement" sub="Paste a client brief in any format" />
            <textarea
              value={raw} onChange={(e) => setRaw(e.target.value)} rows={13}
              className="w-full rounded-[12px] border border-line-soft bg-[#0d1013] px-3.5 py-3 text-[12.5px] leading-relaxed font-mono text-muted outline-none focus:border-line resize-none scroll-thin"
            />
            <div className="flex items-center gap-2 mt-3">
              <button onClick={run} disabled={phase !== "idle"} className="btn btn-primary">
                <Sparkles size={14} /> {phase === "analyzing" ? "Analyzing…" : phase === "matching" ? "Matching…" : "Analyze Requirement"}
              </button>
              <button onClick={() => setRaw(EXAMPLE)} className="btn btn-ghost">Reset example</button>
            </div>
            {error && <div className="mt-3"><ErrorNote message={error} /></div>}
          </Card>

          <AnimatePresence>
            {analysis && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5">
                  <SectionHead title="Extracted requirement" sub="Structured, schema-validated output" right={<SourceTag source={analysis.source} note={analysis.note} />} />
                  <div className="space-y-3">
                    <Field label="Role" value={`${analysis.data.role}${analysis.data.seniority ? ` · ${analysis.data.seniority}` : ""}`} />
                    <Field label="Market / sector" value={`${analysis.data.market || "—"} · ${analysis.data.sector}`} />
                    <Field label="Minimum experience" value={`${analysis.data.minYears}+ years`} />
                    <Chips label="Required skills" items={analysis.data.requiredSkills} tone="accent" />
                    <Chips label="Certifications" items={analysis.data.certifications} />
                    <Chips label="Nice to have" items={[...analysis.data.preferredSkills, ...analysis.data.niceToHave]} />
                    <div>
                      <p className="label mb-1.5">Hard constraints (deterministic gates)</p>
                      <List items={analysis.data.constraints} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <CvUpload />
        </div>

        <div className="lg:col-span-3">
          <SectionHead
            title="Top matches"
            sub={retrieval ? `Semantic retrieval (${retrieval.mode}) returned ${retrieval.returned} candidates → deterministic scoring → ranked` : "Retrieval, then transparent weighted scoring"}
            right={shortlist.length > 0 ? <Badge tone="accent"><Star size={11} /> {shortlist.length} shortlisted</Badge> : <DemoTag>27 seeded candidates</DemoTag>}
          />

          {phase !== "idle" && (
            <Card className="p-6">
              <AiThinking steps={["Analyzing role requirements…", "Searching semantic candidate space…", "Applying deterministic eligibility gates…", "Scoring against weighted criteria…", "Ranking recruiter recommendations…"]} />
            </Card>
          )}

          {!matches && phase === "idle" && (
            <Card className="p-6">
              <Empty icon={<Search size={26} />} title="No search run yet"
                hint="Paste a requirement on the left and run Analyze Requirement. Retrieval proposes; deterministic rules dispose." />
            </Card>
          )}

          {matches && phase === "idle" && (
            <div className="space-y-2.5">
              {matches.map((m, i) => (
                <Card key={m.candidate.id} hover delay={i * 0.04} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="grid place-items-center w-10 h-10 rounded-[12px] border border-line bg-surface-2 text-[12px] font-semibold shrink-0">
                      {m.candidate.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium truncate">{m.candidate.name}</p>
                          <p className="text-[12px] text-muted truncate">{m.candidate.role} · {m.candidate.years} yrs · {m.candidate.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-[20px] font-semibold leading-none ${m.deterministicScore >= 85 ? "text-ok" : m.deterministicScore >= 70 ? "text-accent" : "text-muted"}`}>
                            {m.deterministicScore}%
                          </div>
                          <div className="text-[10px] text-faint mt-1">match score</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {m.candidate.skills.slice(0, 4).map((s) => <Badge key={s}>{s}</Badge>)}
                        {m.candidate.certifications.slice(0, 1).map((s) => <Badge key={s} tone="teal">{s}</Badge>)}
                        <Badge tone={m.candidate.availability === "immediate" ? "ok" : "neutral"}>{m.candidate.availability.replace("_", " ")}</Badge>
                        {!m.eligible && <Badge tone="danger">gate not cleared</Badge>}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mt-3">
                        {(Object.keys(m.breakdown) as (keyof typeof m.breakdown)[]).map((k) => (
                          <div key={k}>
                            <div className="flex justify-between text-[10.5px] text-faint mb-1">
                              <span className="truncate">{WEIGHT_LABELS[k]}</span>
                              <span className="text-muted">{m.breakdown[k]}%</span>
                            </div>
                            <Bar value={m.breakdown[k]} tone={m.breakdown[k] >= 85 ? "ok" : m.breakdown[k] >= 60 ? "accent" : "danger"} height={4} />
                          </div>
                        ))}
                      </div>

                      <p className="text-[12px] text-muted mt-3 leading-relaxed">{m.evidence[1]}</p>

                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setOpen(m)} className="btn !py-1.5"><UserRound size={13} /> View Candidate</button>
                        <button
                          onClick={() => setCompare((c) => c.includes(m.candidate.id) ? c.filter((x) => x !== m.candidate.id) : [...c, m.candidate.id].slice(-3))}
                          className={`btn !py-1.5 ${compare.includes(m.candidate.id) ? "!border-teal !text-teal" : ""}`}>
                          <Scale size={13} /> Compare
                        </button>
                        <button
                          onClick={() => setShortlist((s) => s.includes(m.candidate.id) ? s.filter((x) => x !== m.candidate.id) : [...s, m.candidate.id])}
                          className={`btn !py-1.5 ${shortlist.includes(m.candidate.id) ? "!border-accent !text-accent" : ""}`}>
                          <Star size={13} /> {shortlist.includes(m.candidate.id) ? "Shortlisted" : "Shortlist"}
                        </button>
                        <span className="ml-auto text-[10.5px] text-faint">retrieval {m.retrievalScore.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {compare.length > 1 && matches && <CompareStrip ids={compare} matches={matches} onClear={() => setCompare([])} />}

              <p className="text-[11px] text-faint pt-2 leading-relaxed">
                AI assists recruiter judgement; final employment decisions remain human-led. Scoring uses only job-relevant
                criteria — no protected characteristic is inferred, stored or scored.
              </p>
            </div>
          )}
        </div>
      </div>

      <CandidateDrawer match={open} analysis={analysis?.data ?? null} onClose={() => setOpen(null)} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="label">{label}</span>
      <span className="text-[12.5px] text-fg text-right">{value}</span>
    </div>
  );
}

function Chips({ label, items, tone }: { label: string; items: string[]; tone?: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="label mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">{items.map((s) => <Badge key={s} tone={tone}>{s}</Badge>)}</div>
    </div>
  );
}

function CompareStrip({ ids, matches, onClear }: { ids: string[]; matches: Ranked[]; onClear: () => void }) {
  const rows = matches.filter((m) => ids.includes(m.candidate.id));
  const keys = Object.keys(rows[0].breakdown) as (keyof typeof rows[0]["breakdown"])[];
  return (
    <Card className="p-4">
      <SectionHead title="Comparison" sub="Deterministic sub-scores, side by side" right={<button onClick={onClear} className="btn btn-ghost !text-[12px]">Clear</button>} />
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-[12px] min-w-[520px]">
          <thead>
            <tr className="text-faint">
              <th className="text-left font-normal pb-2">Criterion</th>
              {rows.map((r) => <th key={r.candidate.id} className="text-right font-normal pb-2 truncate">{r.candidate.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k} className="border-t border-line-soft">
                <td className="py-1.5 text-muted">{WEIGHT_LABELS[k]} <span className="text-faint">({Math.round(DEFAULT_WEIGHTS[k] * 100)}%)</span></td>
                {rows.map((r) => <td key={r.candidate.id} className="py-1.5 text-right">{r.breakdown[k]}%</td>)}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="py-2 font-medium">Weighted score</td>
              {rows.map((r) => <td key={r.candidate.id} className="py-2 text-right font-semibold text-accent">{r.deterministicScore}%</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CvUpload() {
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ data: { name: string; role: string; skills: string[]; certifications: string[]; years: number; extractionNotes: string[] }; source: "gemini" | "demo"; indexed: { embeddingMode: string } } | null>(null);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setBusy(true); setErr(""); setRes(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/ingest", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Upload failed");
      setRes(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-5">
      <SectionHead title="Upload CV" sub="Extract → structure → embed into the retrieval layer" />
      <label className="flex flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-line bg-surface px-4 py-6 cursor-pointer hover:border-accent transition-colors">
        <FileUp size={18} className="text-faint" />
        <span className="text-[12.5px] text-muted">{busy ? "Extracting…" : "Choose a .txt, .pdf or .docx file"}</span>
        <span className="text-[10.5px] text-faint">Max 4 MB · MVP extraction, not production-grade parsing</span>
        <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      </label>
      {err && <div className="mt-3"><ErrorNote message={err} /></div>}
      {res && (
        <div className="mt-3 space-y-2 rise">
          <div className="flex items-center gap-2">
            <SourceTag source={res.source} />
            <Badge tone="teal">embedded · {res.indexed.embeddingMode}</Badge>
          </div>
          <p className="text-[13px] font-medium">{res.data.name}</p>
          <p className="text-[12px] text-muted">{res.data.role} · {res.data.years} yrs</p>
          <div className="flex flex-wrap gap-1.5">{res.data.skills.slice(0, 8).map((s) => <Badge key={s}>{s}</Badge>)}</div>
          {res.data.extractionNotes?.length > 0 && <List items={res.data.extractionNotes} />}
        </div>
      )}
    </Card>
  );
}

function CandidateDrawer({ match, analysis, onClose }: { match: Ranked | null; analysis: JobAnalysis | null; onClose: () => void }) {
  const [verdict, setVerdict] = useState<{ data: MatchVerdict; source: "gemini" | "demo"; note?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!match || !analysis) return;
    let cancel = false;
    setVerdict(null); setErr(""); setLoading(true);
    fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysis, candidateId: match.candidate.id }) })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })
      .then((j) => { if (!cancel) setVerdict(j); })
      .catch((e) => { if (!cancel) setErr(e instanceof Error ? e.message : "Evaluation failed"); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [match, analysis]);

  return (
    <AnimatePresence>
      {match && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-screen w-[min(560px,94vw)] border-l border-line-soft bg-[rgba(12,14,17,0.96)] backdrop-blur-2xl overflow-y-auto scroll-thin"
          >
            <div className="sticky top-0 z-10 flex items-center gap-3 px-5 h-16 border-b border-line-soft bg-[rgba(12,14,17,0.9)] backdrop-blur-xl">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold truncate">{match.candidate.name}</p>
                <p className="text-[11.5px] text-faint truncate">{match.candidate.role} · {match.candidate.location}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className={`text-[18px] font-semibold ${match.deterministicScore >= 85 ? "text-ok" : "text-accent"}`}>{match.deterministicScore}%</div>
                <button onClick={onClose} className="btn btn-ghost !px-2"><X size={16} /></button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              <section>
                <p className="label mb-2">Match summary — deterministic</p>
                <div className="space-y-2">
                  {(Object.keys(match.breakdown) as (keyof typeof match.breakdown)[]).map((k) => (
                    <div key={k}>
                      <div className="flex justify-between text-[11.5px] mb-1">
                        <span className="text-muted">{WEIGHT_LABELS[k]} <span className="text-faint">· weight {Math.round(DEFAULT_WEIGHTS[k] * 100)}%</span></span>
                        <span>{match.breakdown[k]}%</span>
                      </div>
                      <Bar value={match.breakdown[k]} tone={match.breakdown[k] >= 85 ? "ok" : match.breakdown[k] >= 60 ? "accent" : "danger"} height={5} />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="label mb-2">Hard eligibility gates</p>
                <div className="space-y-1.5">
                  {match.gates.map((g) => (
                    <div key={g.label} className="flex items-start gap-2.5 rounded-[10px] border border-line-soft bg-surface px-3 py-2">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${g.passed ? "bg-ok" : "bg-danger"}`} />
                      <div>
                        <p className="text-[12.5px]">{g.label}</p>
                        <p className="text-[11px] text-faint">{g.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <p className="label mb-2">Evidence</p>
                <List items={match.evidence} />
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="label">AI reasoning</p>
                  <SourceTag source={verdict?.source} note={verdict?.note} />
                </div>
                {loading && <AiThinking steps={["Reading candidate evidence…", "Comparing against requirement…", "Testing the deterministic score…", "Drafting recruiter recommendation…"]} />}
                {err && <ErrorNote message={err} />}
                {verdict && (
                  <div className="space-y-4 rise">
                    <div className="rounded-[12px] border border-[#4a3a1c] bg-[rgba(226,172,79,0.06)] px-3.5 py-3">
                      <p className="label mb-1.5">AI recommendation</p>
                      <p className="text-[13px] leading-relaxed">{verdict.data.recommendation}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <Badge tone={verdict.data.confidence >= 70 ? "ok" : "warn"}>Confidence {verdict.data.confidence}%</Badge>
                        <Badge>AI score {verdict.data.overallScore}% vs rules {match.deterministicScore}%</Badge>
                      </div>
                    </div>
                    <Block title="Skill alignment" items={verdict.data.strengths} />
                    <Block title="Skill gaps" items={verdict.data.gaps.length ? verdict.data.gaps : match.gaps} />
                    <Block title="Risk flags" items={verdict.data.risks} />
                    <Block title="Recommended training" items={verdict.data.trainingRecommendations} />
                    <Block title="Suggested interview questions" items={verdict.data.interviewQuestions} />
                  </div>
                )}
              </section>

              <p className="text-[11px] text-faint leading-relaxed border-t border-line-soft pt-4">
                AI assists recruiter judgement; final employment decisions remain human-led. This profile is illustrative
                prototype data. No protected characteristic is used in retrieval, scoring or reasoning.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="label mb-2">{title}</p>
      <List items={items} />
    </div>
  );
}
