"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, Compass, Database, GitBranch, GraduationCap,
  Layers, ScrollText, ShieldCheck, Sparkles, Target, Users,
} from "lucide-react";

const CHAIN = [
  "MARKET DEMAND", "SKILL GAP", "TRAINING", "ASSESSMENT",
  "CERTIFICATION", "MATCH", "EMPLOYMENT",
];

const LOOP = ["DATA", "INTELLIGENCE", "DECISION", "ACTION", "MEASUREMENT"];

const CAPABILITIES = [
  { icon: Users, title: "AI Talent Match", body: "Semantic retrieval over the talent pool, then a transparent weighted score with explicit eligibility gates. Evidence, gaps, training and interview questions for every candidate.", href: "/talent", tag: "Retrieval + rules + reasoning" },
  { icon: GraduationCap, title: "Skill Intelligence", body: "Demand becomes trained, assessed, certified, deployable supply — with the conversion rate of every link measured, and the weakest one named.", href: "/skills", tag: "Skill-to-employment" },
  { icon: Compass, title: "Strategy Room", body: "Leadership priorities turned into sequenced initiatives with owners, dependencies, KPI targets, risks and the next seven days of work.", href: "/strategy", tag: "Execution planning" },
  { icon: Brain, title: "Executive Brief", body: "What changed, why it matters, the binding constraint, the biggest opportunity, and the three actions leadership should take today.", href: "/command-center?run=brief", tag: "Daily intelligence" },
  { icon: GitBranch, title: "Decision Support", body: "Options with real pros and cons, reversibility, confidence, and what would change the recommendation — logged so any decision can be reconstructed.", href: "/decisions", tag: "Decision log" },
  { icon: Target, title: "Funnel Diagnosis", body: "Computed anomaly detection across nine stages, then a grounded explanation of the cause and the interventions ranked by effort.", href: "/analytics", tag: "Operational analytics" },
];

const ARCHITECTURE = [
  { icon: Database, k: "Retrieval", v: "Embeddings and vector similarity find who is plausibly relevant. Written against a VectorStore interface, not a vendor." },
  { icon: Brain, k: "Reasoning", v: "Gemini evaluates the retrieved evidence and returns schema-validated JSON. Malformed output never reaches the screen." },
  { icon: ShieldCheck, k: "Deterministic rules", v: "Hard gates and a weighted score a recruiter can audit by hand. The model explains the number — it never produces it." },
];

const ease = [0.2, 0.7, 0.3, 1] as const;

export default function Landing() {
  return (
    <div className="-mx-5 md:-mx-7 -my-6">
      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(760px 380px at 22% 0%, rgba(226,172,79,0.10), transparent 65%)" }} />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-7">
            <span className="chip !text-accent !border-[#4a3a1c] bg-[rgba(226,172,79,0.08)]">
              <Sparkles size={11} /> Strategic AI Prototype
            </span>
            <span className="chip">Concept Demonstration</span>
            <span className="chip">Not an official Ambe International product</span>
          </div>

          <h1 className="text-[clamp(34px,6.4vw,68px)] font-semibold leading-[1.02] tracking-[-0.035em]">
            AMBE
            <span className="bg-gradient-to-r from-[#f0c368] via-[#e2ac4f] to-[#c68f33] bg-clip-text text-transparent"> INTELLIGENCE</span>
          </h1>

          <p className="mt-4 text-[clamp(16px,2.1vw,22px)] text-muted leading-snug max-w-2xl">
            AI Workforce &amp; Executive Command Center
          </p>

          <p className="mt-6 text-[15px] md:text-[16.5px] text-faint leading-relaxed max-w-2xl">
            From skills to opportunity. From decisions to execution. An intelligence layer for workforce
            operations and executive decision-making — not another chatbot bolted onto recruitment.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2.5">
            <Link href="/command-center" className="btn btn-primary !px-4 !py-2.5 !text-[13.5px]">
              Enter Command Center <ArrowRight size={15} />
            </Link>
            <Link href="/talent" className="btn !px-4 !py-2.5 !text-[13.5px]">
              <Users size={15} /> Run a live talent match
            </Link>
            <span className="text-[11.5px] text-faint ml-1 hidden md:inline">or press ⌘K</span>
          </div>
        </motion.div>

        {/* The loop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.7 }}
          className="relative mt-16 flex flex-wrap items-center gap-x-3 gap-y-2">
          {LOOP.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <motion.span
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.09, ease }}
                className="text-[10.5px] tracking-[0.16em] text-faint hover:text-accent transition-colors"
              >
                {s}
              </motion.span>
              {i < LOOP.length - 1 && <span className="text-[10px] text-[#2b3238]">──</span>}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Two layers */}
      <section className="px-6 md:px-12 py-14 border-t border-line-soft">
        <div className="grid lg:grid-cols-2 gap-3.5">
          {[
            {
              n: "01", label: "Layer one", title: "AI Recruitment Intelligence",
              body: "Help recruiters find the right people faster — with a score they can defend to a client, a candidate, and a regulator.",
              steps: ["Requirement analysis", "Skill extraction", "Candidate retrieval", "Semantic matching", "Deterministic scoring", "Gap analysis", "Recruiter decision support"],
              href: "/talent", cta: "Open Talent Match",
            },
            {
              n: "02", label: "Layer two", title: "Chief of Staff Command Center",
              body: "Help leadership move from what is happening to who owns it and whether it got done — in one continuous loop.",
              steps: ["What is happening?", "Why is it happening?", "What matters?", "What should we do?", "Who owns it?", "By when?", "Did it get done?"],
              href: "/command-center", cta: "Open Command Center",
            },
          ].map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className="card card-hover p-6 md:p-7 flex flex-col"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[30px] font-semibold text-[#2b3238] leading-none">{c.n}</span>
                <span className="label">{c.label}</span>
              </div>
              <h3 className="text-[19px] font-semibold mt-4 tracking-[-0.02em]">{c.title}</h3>
              <p className="text-[13.5px] text-muted mt-2.5 leading-relaxed">{c.body}</p>

              <div className="flex flex-wrap gap-1.5 mt-5">
                {c.steps.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>

              <Link href={c.href} className="btn btn-ghost mt-6 self-start !px-0 !text-accent hover:!bg-transparent">
                {c.cta} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Skill chain */}
      <section className="px-6 md:px-12 py-14 border-t border-line-soft">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <p className="label mb-2">Skill-to-employment</p>
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.025em]">
              Every link has a conversion rate. The weakest one caps the chain.
            </h2>
          </div>
          <Link href="/skills" className="btn"><GraduationCap size={14} /> Open Skill Intelligence</Link>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CHAIN.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06, ease }}
              className="flex-1 min-w-[122px] rounded-[13px] border border-line-soft bg-surface px-3.5 py-4 relative overflow-hidden group hover:border-line transition-colors"
            >
              <span className="absolute inset-x-0 bottom-0 h-[2px]"
                style={{ background: i === 1 ? "var(--color-danger)" : i >= 5 ? "var(--color-ok)" : "var(--color-accent)", opacity: 0.65 }} />
              <p className="text-[9.5px] tracking-[0.1em] text-faint group-hover:text-muted transition-colors">{s}</p>
              <p className="text-[11px] text-[#2b3238] mt-2 tabular-nums">{String(i + 1).padStart(2, "0")}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="px-6 md:px-12 py-14 border-t border-line-soft">
        <p className="label mb-2">What it does</p>
        <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.025em] mb-7 max-w-2xl">
          Six surfaces, one spine. Analysis that does not become owned work is decoration.
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CAPABILITIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.07, ease }}
              >
                <Link href={c.href} className="card card-hover p-5 block h-full group">
                  <div className="flex items-start justify-between">
                    <div className="grid place-items-center w-9 h-9 rounded-[11px] border border-line bg-surface-2">
                      <Icon size={16} className="text-accent" />
                    </div>
                    <ArrowRight size={14} className="text-[#2b3238] group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-[14.5px] font-medium mt-4">{c.title}</h3>
                  <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed">{c.body}</p>
                  <span className="chip mt-4">{c.tag}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture */}
      <section className="px-6 md:px-12 py-14 border-t border-line-soft">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <p className="label mb-2">How it is built</p>
            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.025em] leading-tight">
              Retrieval proposes.<br />Rules dispose.<br />
              <span className="text-faint">Reasoning explains.</span>
            </h2>
            <p className="text-[13px] text-muted mt-4 leading-relaxed">
              The LLM is deliberately not trusted with the score. That is what makes a match defensible
              instead of merely impressive.
            </p>
            <Link href="/responsible-ai" className="btn mt-6"><ScrollText size={14} /> Responsible AI</Link>
          </div>

          <div className="lg:col-span-2 space-y-2.5">
            {ARCHITECTURE.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.k}
                  initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.09, ease }}
                  className="card p-5 flex items-start gap-4"
                >
                  <div className="grid place-items-center w-9 h-9 rounded-[11px] border border-line bg-surface-2 shrink-0">
                    <Icon size={16} className="text-teal" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">{a.k}</p>
                    <p className="text-[12.5px] text-muted mt-1 leading-relaxed">{a.v}</p>
                  </div>
                </motion.div>
              );
            })}
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {["Next.js", "TypeScript", "Gemini", "Embeddings + RAG", "VectorStore interface", "Zod-validated JSON", "Human-in-the-loop"].map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="px-6 md:px-12 py-16 border-t border-line-soft">
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="card p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(560px 260px at 88% 10%, rgba(79,195,174,0.09), transparent 62%)" }} />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Layers size={18} className="text-accent mb-4" />
              <h2 className="text-[22px] md:text-[27px] font-semibold tracking-[-0.025em] leading-tight">
                An intelligence layer for workforce operations and executive decision-making.
              </h2>
              <p className="text-[13px] text-muted mt-3.5 leading-relaxed">
                All candidates, clients, markets and metrics in this prototype are fictional and labelled
                <span className="text-fg"> Illustrative prototype data</span>. AI assists recruiter and leadership
                judgement; humans make the decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/command-center" className="btn btn-primary !px-4 !py-2.5 !text-[13.5px]">
                Enter Command Center <ArrowRight size={15} />
              </Link>
              <Link href="/skills" className="btn !px-4 !py-2.5 !text-[13.5px]">Skill Intelligence</Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
