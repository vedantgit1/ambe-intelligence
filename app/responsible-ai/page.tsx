"use client";

import { useEffect, useState } from "react";
import {
  Eye, FileLock2, Gauge, Layers, Scale, ScrollText, UserCheck,
} from "lucide-react";
import { Badge, Card, PageHead, SectionHead } from "@/components/ui/primitives";
import type { SystemStatus } from "@/components/Shell";

const PRINCIPLES = [
  { icon: UserCheck, title: "Human-in-the-loop", body: "AI supports recruiters and leaders; humans make final decisions. Every shortlist is approved by a named recruiter and every selection by a named hiring manager. The platform never auto-rejects a candidate." },
  { icon: Eye, title: "Explainability", body: "Each score is decomposed into weighted, job-relevant criteria with the evidence that produced it. The number a recruiter sees can be reconstructed by hand — the model explains the score, it does not produce it." },
  { icon: Scale, title: "Fairness", body: "Protected characteristics — religion, caste, race, ethnicity, gender, age, disability, marital status — are never used in retrieval, scoring or reasoning, and CV extraction is instructed not to capture them at all." },
  { icon: FileLock2, title: "Privacy", body: "Candidate data stays server-side. API keys live only in environment variables and never reach the browser bundle. Uploaded documents are processed in memory for the session and are not persisted in this prototype." },
  { icon: Layers, title: "Data minimisation", body: "Only job-relevant fields are sent to the model: role, skills, experience, certifications, languages, availability and market eligibility. Contact details and identity document numbers are excluded from model context." },
  { icon: ScrollText, title: "Auditability", body: "Deterministic scores, hard gates, retrieval sources and the prompt version are all recoverable, so any AI-assisted recommendation can be reconstructed after the fact." },
  { icon: Gauge, title: "Confidence", body: "The system distinguishes strong evidence from uncertainty, labels every answer as Gemini reasoning or demo intelligence, and shows which internal documents grounded it." },
];

export default function ResponsibleAiPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => {}); }, []);

  return (
    <div>
      <PageHead title="Responsible AI" sub="The constraints this system operates under — stated, not implied."
        right={<Badge tone="teal">Strategic AI Prototype — Concept Demonstration</Badge>} />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {PRINCIPLES.map((p, i) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} hover delay={i * 0.05} className="p-5">
              <div className="grid place-items-center w-9 h-9 rounded-[11px] border border-line bg-surface-2 mb-3">
                <Icon size={16} className="text-accent" />
              </div>
              <p className="text-[13.5px] font-medium">{p.title}</p>
              <p className="text-[12.5px] text-muted mt-1.5 leading-relaxed">{p.body}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-3.5 mt-3.5">
        <Card className="p-5">
          <SectionHead title="System status" sub="What is actually running right now" />
          <div className="space-y-1.5">
            <Row k="Gemini API" v={status?.gemini === "connected" ? "Connected" : "Demo intelligence"} />
            <Row k="Reasoning model" v={status?.models.reasoning ?? "—"} />
            <Row k="Fast model" v={status?.models.fast ?? "—"} />
            <Row k="Embedding model" v={status?.retrieval.mode === "gemini" ? status.models.embedding : "lexical fallback (offline)"} />
            <Row k="Vector store" v={status?.retrieval.store ?? "—"} />
            <Row k="Knowledge base" v={`${status?.knowledgeBase ?? 0} documents · ${status?.retrieval.chunks ?? 0} chunks`} />
            <Row k="Candidates indexed" v={`${status?.retrieval.vectors ?? 0}`} />
            <Row k="Active requirements" v={`${status?.requirements ?? 0} demo requirements`} />
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead title="Scope and honesty" sub="What this prototype is, and what it is not" />
          <div className="space-y-2.5 text-[12.5px] text-muted leading-relaxed">
            <p><span className="text-fg">Not an official Ambe International product.</span> This is an independent concept demonstration built to show a product and AI-transformation approach.</p>
            <p><span className="text-fg">All data is fictional.</span> Candidates, clients, markets and metrics were written for this prototype. No figure here describes real operations.</p>
            <p><span className="text-fg">Document parsing is MVP-grade.</span> Plain text extracts reliably; text-based PDFs are best-effort. This is not production document intelligence.</p>
            <p><span className="text-fg">Storage is in-memory.</span> Retrieval runs through a <code className="text-teal">VectorStore</code> interface so production can move to pgvector or a managed vector database without touching the layers above.</p>
            <p><span className="text-fg">Demo intelligence is labelled.</span> When Gemini is unavailable, answers are computed deterministically from the same seeded data and marked as such — never presented as model output.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-1.5 last:border-0">
      <span className="text-[12px] text-faint">{k}</span>
      <span className="text-[12px] text-fg truncate">{v}</span>
    </div>
  );
}
